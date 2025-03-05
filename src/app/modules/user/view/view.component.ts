import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import mammoth from 'mammoth';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  file: { name: string; file: File; base64: string } | null = null;
  fileViewerUrl: SafeResourceUrl | null = null;
  textContent: string | null = null;
  docxContent: string | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const storedFile = localStorage.getItem('file');
    this.file = storedFile ? JSON.parse(storedFile) : null;

    if (this.file) {
      this.prepareFileForView(this.file.base64, this.file.name);
    }
  }

  prepareFileForView(base64: string, filename: string): void {
    if (filename.endsWith('.pdf')) {
      // Directly use the PDF file
      this.fileViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
    } else if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      // Convert image to data URL for display
      this.fileViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
    } else if (filename.endsWith('.txt')) {
      // Display text content
      this.textContent = this.decodeBase64(base64);
      this.fileViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`data:text/plain;base64,${base64.split(',')[1]}`);
    } else if (filename.endsWith('.docx')) {
      // Extract DOCX content and display as text
      this.extractDocxContent(base64).then((text) => {
        this.docxContent = text;
        this.fileViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`data:text/plain;base64,${btoa(text)}`);
      });
    } else {
      // Unsupported file type
      this.fileViewerUrl = null;
    }
  }

  decodeBase64(base64: string): string {
    return atob(base64.split(',')[1]);
  }

  async extractDocxContent(base64: string): Promise<string> {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers).buffer;
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    const arrayBuffer = await new Response(blob).arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  downloadFile(): void {
    if (this.file) {
      const link = document.createElement('a');
      link.href = this.file.base64;
      link.download = this.file.name;
      link.click();
    }
  }
}