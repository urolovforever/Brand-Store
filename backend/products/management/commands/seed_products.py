from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Category, Color, Size, Product, ProductImage
import io
from PIL import Image


class Command(BaseCommand):
    help = 'Seed database with sample products'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database with sample data...')

        # Create categories
        self.stdout.write('Creating categories...')
        categories_data = [
            {'name': 'T-Shirts', 'description': 'Comfortable cotton t-shirts'},
            {'name': 'Hoodies', 'description': 'Warm hoodies and sweatshirts'},
            {'name': 'Hats', 'description': 'Stylish caps and beanies'},
            {'name': 'Bags', 'description': 'Backpacks and tote bags'},
            {'name': 'Accessories', 'description': 'Mugs, stickers and more'},
        ]

        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            categories[cat.name] = cat
            if created:
                self.stdout.write(f'  Created: {cat.name}')

        # Create colors
        self.stdout.write('\nCreating colors...')
        colors_data = [
            {'name': 'Black', 'hex_code': '#000000'},
            {'name': 'White', 'hex_code': '#FFFFFF'},
            {'name': 'Navy', 'hex_code': '#1F3A93'},
            {'name': 'Red', 'hex_code': '#E74C3C'},
            {'name': 'Green', 'hex_code': '#27AE60'},
            {'name': 'Blue', 'hex_code': '#3498DB'},
            {'name': 'Gray', 'hex_code': '#95A5A6'},
        ]

        colors = {}
        for color_data in colors_data:
            color, created = Color.objects.get_or_create(
                name=color_data['name'],
                defaults={'hex_code': color_data['hex_code']}
            )
            colors[color.name] = color
            if created:
                self.stdout.write(f'  Created: {color.name}')

        # Create sizes
        self.stdout.write('\nCreating sizes...')
        sizes_data = [
            {'name': 'XS', 'order': 1},
            {'name': 'S', 'order': 2},
            {'name': 'M', 'order': 3},
            {'name': 'L', 'order': 4},
            {'name': 'XL', 'order': 5},
            {'name': 'XXL', 'order': 6},
        ]

        sizes = {}
        for size_data in sizes_data:
            size, created = Size.objects.get_or_create(
                name=size_data['name'],
                defaults={'order': size_data['order']}
            )
            sizes[size.name] = size
            if created:
                self.stdout.write(f'  Created: {size.name}')

        # Create products
        self.stdout.write('\nCreating products...')
        products_data = [
            {
                'name': 'University Logo T-Shirt',
                'short_description': 'Classic cotton t-shirt with university logo',
                'description': 'High-quality 100% cotton t-shirt featuring the official university logo. Perfect for campus wear or showing school spirit.',
                'category': categories['T-Shirts'],
                'price': 150000,
                'discount_percentage': 0,
                'stock': 100,
                'is_new': True,
                'is_featured': True,
                'colors': ['Black', 'White', 'Navy'],
                'sizes': ['S', 'M', 'L', 'XL'],
                'image_colors': ['#1F3A93', '#FFFFFF', '#000000']  # For placeholder images
            },
            {
                'name': 'Premium Hoodie',
                'short_description': 'Warm and comfortable hoodie',
                'description': 'Premium quality hoodie with soft fleece interior. Features university branding and front pocket.',
                'category': categories['Hoodies'],
                'price': 350000,
                'discount_percentage': 15,
                'stock': 50,
                'is_new': True,
                'is_featured': True,
                'colors': ['Black', 'Navy', 'Gray'],
                'sizes': ['M', 'L', 'XL', 'XXL'],
                'image_colors': ['#000000', '#1F3A93', '#95A5A6']
            },
            {
                'name': 'Baseball Cap',
                'short_description': 'Adjustable baseball cap with embroidered logo',
                'description': 'Classic baseball cap with embroidered university logo. Adjustable strap for perfect fit.',
                'category': categories['Hats'],
                'price': 80000,
                'discount_percentage': 0,
                'stock': 75,
                'is_new': False,
                'is_featured': False,
                'colors': ['Black', 'Navy', 'Red'],
                'sizes': [],
                'image_colors': ['#000000', '#1F3A93', '#E74C3C']
            },
            {
                'name': 'Campus Backpack',
                'short_description': 'Spacious backpack for all your essentials',
                'description': 'Durable backpack with multiple compartments, laptop sleeve, and water bottle holder. Perfect for students.',
                'category': categories['Bags'],
                'price': 250000,
                'discount_percentage': 20,
                'stock': 30,
                'is_new': False,
                'is_featured': True,
                'colors': ['Black', 'Navy'],
                'sizes': [],
                'image_colors': ['#000000', '#1F3A93']
            },
            {
                'name': 'University Mug',
                'short_description': 'Ceramic mug with university crest',
                'description': 'High-quality ceramic mug featuring the university crest. Microwave and dishwasher safe.',
                'category': categories['Accessories'],
                'price': 45000,
                'discount_percentage': 0,
                'stock': 200,
                'is_new': False,
                'is_featured': False,
                'colors': ['White'],
                'sizes': [],
                'image_colors': ['#FFFFFF']
            },
            {
                'name': 'Sport Performance Tee',
                'short_description': 'Athletic fit t-shirt for sports and gym',
                'description': 'Moisture-wicking performance fabric perfect for athletic activities. Features university athletics branding.',
                'category': categories['T-Shirts'],
                'price': 180000,
                'discount_percentage': 10,
                'stock': 60,
                'is_new': True,
                'is_featured': False,
                'colors': ['Black', 'Navy', 'Red'],
                'sizes': ['S', 'M', 'L', 'XL'],
                'image_colors': ['#000000', '#1F3A93', '#E74C3C']
            },
            {
                'name': 'Tote Bag',
                'short_description': 'Eco-friendly canvas tote bag',
                'description': 'Sustainable canvas tote bag with university logo. Perfect for books, groceries, or everyday use.',
                'category': categories['Bags'],
                'price': 65000,
                'discount_percentage': 0,
                'stock': 150,
                'is_new': False,
                'is_featured': False,
                'colors': ['White', 'Navy'],
                'sizes': [],
                'image_colors': ['#FFFFFF', '#1F3A93']
            },
            {
                'name': 'Zip-Up Hoodie',
                'short_description': 'Full-zip hoodie with pockets',
                'description': 'Comfortable zip-up hoodie with front pockets and hood. Perfect for layering in cooler weather.',
                'category': categories['Hoodies'],
                'price': 380000,
                'discount_percentage': 25,
                'stock': 40,
                'is_new': False,
                'is_featured': True,
                'colors': ['Black', 'Gray', 'Navy'],
                'sizes': ['M', 'L', 'XL'],
                'image_colors': ['#000000', '#95A5A6', '#1F3A93']
            },
        ]

        for product_data in products_data:
            # Extract relationships
            product_colors = product_data.pop('colors')
            product_sizes = product_data.pop('sizes')
            image_colors = product_data.pop('image_colors')

            # Create or get product
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults=product_data
            )

            if created:
                self.stdout.write(f'  Created: {product.name}')

                # Add colors
                for color_name in product_colors:
                    if color_name in colors:
                        product.colors.add(colors[color_name])

                # Add sizes
                for size_name in product_sizes:
                    if size_name in sizes:
                        product.sizes.add(sizes[size_name])

                # Create placeholder images
                for idx, color_hex in enumerate(image_colors):
                    # Create a simple colored placeholder image
                    img = Image.new('RGB', (800, 1000), color=color_hex)

                    # Add some text (optional, basic)
                    # Note: This requires PIL/Pillow ImageDraw which might not have fonts

                    # Save to BytesIO
                    buffer = io.BytesIO()
                    img.save(buffer, format='JPEG', quality=85)
                    buffer.seek(0)

                    # Create ProductImage
                    product_image = ProductImage.objects.create(
                        product=product,
                        alt_text=f'{product.name} - Image {idx + 1}',
                        is_primary=(idx == 0),
                        order=idx
                    )
                    product_image.image.save(
                        f'{product.slug}_{idx + 1}.jpg',
                        ContentFile(buffer.read()),
                        save=True
                    )

                product.save()

        self.stdout.write(self.style.SUCCESS('\n✓ Database seeded successfully!'))
        self.stdout.write(f'Created {Product.objects.count()} products')
        self.stdout.write(f'Created {ProductImage.objects.count()} product images')
