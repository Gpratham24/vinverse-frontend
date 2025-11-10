"""
PythonAnywhere WSGI configuration file for VinVerse Django project.

INSTRUCTIONS:
1. Copy this file content to your PythonAnywhere WSGI file
2. Replace 'yourusername' with your actual PythonAnywhere username
3. Replace 'your_project_folder' with your actual project folder name (usually 'VinVerse' or 'backend')
4. The WSGI file path will be something like: /var/www/yourusername_pythonanywhere_com_wsgi.py
5. You can find and edit it from: Web Tab → WSGI configuration file
"""

import os
import sys

# Add your project directory to the Python path
# Replace 'yourusername' with your PythonAnywhere username
# Replace 'your_project_folder' with your actual project folder name
path = '/home/yourusername/your_project_folder/backend'
if path not in sys.path:
    sys.path.append(path)

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vinverse.settings')

# Get the WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

