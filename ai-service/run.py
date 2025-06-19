import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False
    return True

def run_app():
    """Run the Flask application"""
    try:
        from app import app
        print("🚀 Starting AI Service on http://localhost:5001")
        app.run(debug=True, host='0.0.0.0', port=5001)
    except ImportError as e:
        print(f"❌ Error importing app: {e}")
        print("Make sure all requirements are installed.")

if __name__ == "__main__":
    print("🔧 Setting up AI Service...")
    
    if install_requirements():
        print("📚 Starting Flask AI Service...")
        run_app()
    else:
        print("❌ Failed to install requirements. Please check your Python environment.")