import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import mammoth from 'mammoth';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  file: { name: string; file: File; base64: string } | null = null;
  textContent:string|null=null;
  docxContent:string|null=null;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const storedFile = localStorage.getItem('file');
    this.file = storedFile ? JSON.parse(storedFile) : null;
  
    if (this.file) {
      console.log('File received:', this.file);
      if(this.file.name.endsWith('.txt')){
        this.textContent=this.decodeBase64(this.file.base64);
      }
      else if(this.file.name.endsWith('.docx')){
        this.extractDocxContent(this.file.base64);
      }
      
    } else {
      console.log('No file received');
    }
  }
  decodeBase64(base64:string):string{
    return atob(base64.split(',')[1]);
  }

  extractDocxContent(base64: string): void {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers).buffer; // Fix: Convert to ArrayBuffer
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

     // Convert Blob to ArrayBuffer
     const fileReader = new FileReader();
     fileReader.onload = () => {
       const arrayBuffer = fileReader.result as ArrayBuffer;
       mammoth.extractRawText({ arrayBuffer })
         .then((result) => {
           this.docxContent = result.value; // Set the extracted text content
         })
         .catch((error) => {
           console.error('Error extracting .docx content:', error);
           this.docxContent = 'Unable to display .docx content.';
         });
     };
     fileReader.readAsArrayBuffer(blob);
  }
}