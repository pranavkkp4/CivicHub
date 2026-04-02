import os
import shutil
from typing import Tuple, Optional
from fastapi import UploadFile
import PyPDF2
import io


class FileService:
    """Service for handling file uploads and text extraction"""
    
    async def save_and_extract(
        self, 
        file: UploadFile, 
        upload_dir: str,
        max_size: int = 10 * 1024 * 1024  # 10MB
    ) -> Tuple[str, str]:
        """Save uploaded file and extract text content"""
        
        # Validate file size
        contents = await file.read()
        if len(contents) > max_size:
            raise ValueError(f"File too large. Maximum size is {max_size / 1024 / 1024}MB")
        
        # Create upload directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate safe filename
        safe_filename = self._sanitize_filename(file.filename)
        file_path = os.path.join(upload_dir, safe_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Extract text based on file type
        content = ""
        if file.filename.lower().endswith('.pdf'):
            content = self._extract_pdf_text(contents)
        else:
            # Try to decode as text
            try:
                content = contents.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    content = contents.decode('latin-1')
                except:
                    content = "[Binary file - text extraction not available]"
        
        return file_path, content
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe storage"""
        # Remove path components and unsafe characters
        filename = os.path.basename(filename)
        # Keep only alphanumeric, dots, dashes, and underscores
        safe_chars = ''.join(c for c in filename if c.isalnum() or c in '._-')
        return safe_chars or "uploaded_file"
    
    def _extract_pdf_text(self, pdf_content: bytes) -> str:
        """Extract text from PDF content"""
        try:
            pdf_file = io.BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            return f"[Error extracting PDF text: {str(e)}]"
    
    async def extract_text_from_file(self, file_path: str) -> str:
        """Extract text from an existing file"""
        if not os.path.exists(file_path):
            return "[File not found]"
        
        try:
            with open(file_path, 'rb') as f:
                contents = f.read()
            
            if file_path.lower().endswith('.pdf'):
                return self._extract_pdf_text(contents)
            else:
                try:
                    return contents.decode('utf-8')
                except UnicodeDecodeError:
                    return contents.decode('latin-1')
        except Exception as e:
            return f"[Error reading file: {str(e)}]"


file_service = FileService()
