import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import mammoth from 'mammoth';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  file: { name: string; file: File; base64: string; size: number; lastModified: Date; type: string } | null = null;
  fileViewerUrl: SafeResourceUrl | null = null;
  textContent: string | null = null;
  docxContent: string | null = null;
  zoomLevel: number = 1;
  isFullScreen: boolean = false;
  isProcessing: boolean = false; // For loading animation
  isFavorite: boolean = false; // For favorite files
  imageRotation: number = 0; // For image rotation
  isReading: boolean = false; // For read aloud state
  speechSynthesis: SpeechSynthesis | null = null; // For speech synthesis
  utterance: SpeechSynthesisUtterance | null = null; // For speech utterance

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const storedFile = localStorage.getItem('file');
    this.file = storedFile ? JSON.parse(storedFile) : null;

    if (this.file) {
      this.isProcessing = true; // Show loading animation
      setTimeout(() => {
        this.prepareFileForView(this.file!.base64, this.file!.name);
        this.isProcessing = false; // Hide loading animation
      }, 2000); // Simulate processing delay for large files
    }

    // Load favorite status from localStorage
    this.isFavorite = localStorage.getItem('favorite') === 'true';

    // Initialize speech synthesis
    this.speechSynthesis = window.speechSynthesis;
  }

  prepareFileForView(base64: string, filename: string): void {
    if (filename.endsWith('.pdf')) {
      this.fileViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
    } else if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      this.fileViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
    } else if (filename.endsWith('.txt')) {
      this.textContent = this.decodeBase64(base64);
      this.fileViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`data:text/plain;base64,${base64.split(',')[1]}`);
    } else if (filename.endsWith('.docx')) {
      this.extractDocxContent(base64).then((text) => {
        this.docxContent = text;
        this.fileViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`data:text/plain;base64,${btoa(text)}`);
      });
    } else {
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

  zoomIn(): void {
    this.zoomLevel += 0.1;
  }

  zoomOut(): void {
    this.zoomLevel -= 0.1;
  }

  toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
  }

  rotateImage(): void {
    this.imageRotation = (this.imageRotation + 90) % 360;
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    localStorage.setItem('favorite', this.isFavorite.toString());
  }

  readAloud(): void {
    if (this.speechSynthesis && (this.textContent || this.docxContent)) {
      if (this.isReading) {
        // Stop reading
        this.speechSynthesis.cancel();
        this.isReading = false;
      } else {
        // Start reading
        const text = this.textContent || this.docxContent;
        this.utterance = new SpeechSynthesisUtterance(text!);
        this.utterance.onend = () => {
          this.isReading = false; // Update state when reading ends
        };
        this.speechSynthesis.speak(this.utterance);
        this.isReading = true;
      }
    }
  }
}