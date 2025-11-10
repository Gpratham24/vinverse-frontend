# 🚀 Django Deployment Guide for PythonAnywhere

This guide will help you deploy your VinVerse Django backend to PythonAnywhere.

## 📋 Prerequisites

- PythonAnywhere account (free or paid)
- Your Django project ready for deployment
- GitHub repository (recommended) or ability to upload files

---

## ⚙️ Step 1: Prep Your Codebase

### 1.1 Install Required Packages

Make sure you have `gunicorn` and `whitenoise` installed locally (they're already in `requirements.txt`):

```bash
cd backend
pip install gunicorn whitenoise
pip freeze > requirements.txt
```

### 1.2 Update Settings

The following settings have already been configured in `settings.py`:

✅ **ALLOWED_HOSTS**: Automatically detects PythonAnywhere domains
✅ **DEBUG**: Automatically set to `False` on PythonAnywhere
✅ **WhiteNoise**: Configured for static file serving
✅ **CORS**: Configured to allow PythonAnywhere domains

**Note**: If you need to manually set your domain, add this to your `.env` file:

```
PYTHONANYWHERE_DOMAIN=yourusername.pythonanywhere.com
```

### 1.3 Collect Static Files (Local - Optional)

You can collect static files locally before uploading, or do it on PythonAnywhere:

```bash
python manage.py collectstatic
```

---

## 📤 Step 2: Upload Your Code

You have two options:

### Option 1: Using GitHub (Recommended)

1. **Push your code to GitHub** (if not already done):

```bash
git add .
git commit -m "Prepare for PythonAnywhere deployment"
git push origin main
```

2. **On PythonAnywhere Console**:

```bash
cd ~
git clone https://github.com/yourusername/your-repo.git
# Or if you already cloned it, pull the latest:
cd your-repo
git pull origin main
```

### Option 2: Using File Upload

1. **Zip your project** (excluding `venv`, `__pycache__`, `.git`, etc.)
2. Go to PythonAnywhere **Files** tab
3. Navigate to `/home/yourusername/`
4. Click **Upload a file** and upload your zip
5. Extract it:

```bash
cd ~
unzip your-project.zip
```

---

## 🐍 Step 3: Set Up Virtual Environment

1. **Open a Bash console** on PythonAnywhere
2. **Create a virtual environment**:

```bash
cd ~/your_project_folder/backend
mkvirtualenv myenv --python=python3.10
# Or use the existing venv if you uploaded it
```

3. **Activate the virtual environment**:

```bash
workon myenv
# Or if using existing venv:
source venv/bin/activate
```

4. **Install dependencies**:

```bash
cd ~/your_project_folder/backend
pip install -r requirements.txt
```

**Note**: PythonAnywhere free accounts use Python 3.10. Paid accounts can use newer versions.

---

## ⚙️ Step 4: Configure WSGI App

1. **Go to the Web tab** on PythonAnywhere dashboard
2. **Click "Add a new web app"** (or edit existing)
3. **Select "Manual configuration"** → **Django**
4. **Edit the WSGI file** (you'll see a link like `/var/www/yourusername_pythonanywhere_com_wsgi.py`)

5. **Replace the WSGI file content** with the template from `pythonanywhere_wsgi.py`:

```python
import os
import sys

# Update these paths with your actual username and project folder
path = '/home/yourusername/your_project_folder/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vinverse.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

**Important**: Replace:

- `yourusername` → Your PythonAnywhere username
- `your_project_folder` → Your actual project folder name (e.g., `VinVerse`)

---

## 📁 Step 5: Configure Static Files

1. **In the Web tab**, scroll to **Static files** section
2. **Add static file mapping**:

| URL        | Directory                                                    |
| ---------- | ------------------------------------------------------------ |
| `/static/` | `/home/yourusername/your_project_folder/backend/staticfiles` |

3. **If you have media files**, add:

| URL       | Directory                                              |
| --------- | ------------------------------------------------------ |
| `/media/` | `/home/yourusername/your_project_folder/backend/media` |

**Note**: The `staticfiles` directory will be created when you run `collectstatic`.

---

## 🗄️ Step 6: Set Up Database

### Option A: Use Existing Supabase Database (Recommended)

Your project is already configured to use Supabase. Just set environment variables:

1. **Go to Web tab** → **Environment variables**
2. **Add your Supabase credentials**:

```
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.pzvqevdqywmbmgpfamcz.supabase.co:5432/postgres
```

Or individual settings:

```
SUPABASE_DB_HOST=db.pzvqevdqywmbmgpfamcz.supabase.co
SUPABASE_DB_PASSWORD=your_password
SUPABASE_DB_USER=postgres
SUPABASE_DB_NAME=postgres
SUPABASE_DB_PORT=5432
```

### Option B: Use PythonAnywhere MySQL (Free Account)

1. **Go to Databases tab** → Create a MySQL database
2. **Update settings.py** to use MySQL (or set `DATABASE_URL` environment variable)

---

## 🔧 Step 7: Set Environment Variables

In the **Web tab** → **Environment variables**, add:

```
SECRET_KEY=your-secret-key-here
DEBUG=False
PYTHONANYWHERE_USERNAME=yourusername
# Add your Supabase credentials (see Step 6)
# Add any other environment variables your app needs
```

**Important**:

- Never commit your `SECRET_KEY` to GitHub
- Generate a new secret key for production: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

---

## 🚀 Step 8: Run Migrations & Collect Static

1. **Open a Bash console** (with your virtualenv activated)
2. **Navigate to your project**:

```bash
cd ~/your_project_folder/backend
workon myenv  # or source venv/bin/activate
```

3. **Run migrations**:

```bash
python manage.py migrate
```

4. **Create superuser** (if needed):

```bash
python manage.py createsuperuser
```

5. **Collect static files**:

```bash
python manage.py collectstatic
```

This will create the `staticfiles` directory with all your static files.

---

## 🔄 Step 9: Restart the Web App

1. **Go to Web tab**
2. **Click the green "Reload" button** (or "Reload yourusername.pythonanywhere.com")

Your Django app should now be live at:
**https://yourusername.pythonanywhere.com/**

---

## 🐛 Troubleshooting

### Common Issues:

1. **Import Errors in WSGI**:

   - Check that your project path in WSGI file is correct
   - Make sure virtualenv is activated when installing packages
   - Verify `DJANGO_SETTINGS_MODULE` is set correctly

2. **Static Files Not Loading**:

   - Run `python manage.py collectstatic`
   - Check static file mappings in Web tab
   - Verify `STATIC_ROOT` path in settings.py

3. **Database Connection Errors**:

   - Verify environment variables are set correctly
   - Check Supabase connection string format
   - Ensure SSL is enabled for Supabase connections

4. **500 Internal Server Error**:

   - Check error log in Web tab
   - Verify `DEBUG=False` and `ALLOWED_HOSTS` includes your domain
   - Check server log for runtime errors

5. **CORS Errors**:
   - Verify your frontend domain is in `CORS_ALLOWED_ORIGINS`
   - Check that `CORS_ALLOW_CREDENTIALS=True`

### Viewing Logs:

- **Error log**: Web tab → Error log link
- **Server log**: Web tab → Server log link
- **Console output**: Use Bash console for debugging

---

## 📝 Additional Notes

### Redis & Celery (Optional)

If you're using Redis/Celery:

- PythonAnywhere free accounts don't support Redis
- Consider using database-backed cache (already configured as fallback)
- For Celery, you may need a paid account or external Redis service

### WebSockets (Django Channels)

- PythonAnywhere free accounts don't support WebSockets
- You'll need a paid account or use a different service for WebSocket support
- The app will fall back to in-memory channel layer if Redis is unavailable

### Scheduled Tasks

- Use PythonAnywhere **Tasks** tab to schedule periodic tasks
- Or use external services like Celery Beat (requires Redis)

---

## ✅ Deployment Checklist

- [ ] Code uploaded to PythonAnywhere
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] WSGI file configured correctly
- [ ] Static files mapped in Web tab
- [ ] Environment variables set (SECRET_KEY, database, etc.)
- [ ] Database migrations run (`python manage.py migrate`)
- [ ] Static files collected (`python manage.py collectstatic`)
- [ ] Web app reloaded
- [ ] Tested the live URL
- [ ] Checked error logs for any issues

---

## 🎉 You're Done!

Your Django backend should now be live on PythonAnywhere!

**Next Steps**:

- Update your frontend to point to the new backend URL
- Set up custom domain (if using paid account)
- Configure SSL certificate (automatic on PythonAnywhere)
- Monitor logs for any issues

---

## 📚 Resources

- [PythonAnywhere Help Docs](https://help.pythonanywhere.com/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [WhiteNoise Documentation](https://whitenoise.readthedocs.io/)

---

**Need Help?** Check the error logs in the Web tab or consult PythonAnywhere's help documentation.
