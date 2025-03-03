import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CouchdbService } from '../../../services/couchdb.service';
import * as mammoth from 'mammoth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  username: string = '';
  userId!: string;
  userRevId!: string;
  selectedFiles: File[] = []; // Store multiple files
  uploadedFiles: { name: string; file: File; base64: string; uploadedDate: Date; fileType: string }[] = [];
  filteredFiles: { name: string; file: File; base64: string; uploadedDate: Date; fileType: string }[] = [];
  searchQuery: string = '';
  isDragOver: boolean = false;
  uploadMessage: string = '';
  uploadButtonText: string = 'Upload File'; // Dynamic button text
  deletedFiles: { name: string; file: File; base64: string; uploadedDate: Date; fileType: string }[] = [];
  renameIndex: number | null = null;
  newFileName: string = '';

  // File preview overlay
  isPreviewOpen: boolean = false;
  previewFile: { name: string; file: File; base64: string; uploadedDate: Date; fileType: string } | null = null;
  previewTextContent: string | null = null;
  previewDocxContent: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly couchDbService: CouchdbService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.username = 'User';
      this.userId = localStorage.getItem('userId') ?? '';
      this.userRevId = localStorage.getItem('userRevId') ?? '';

      if (!this.userId) {
        this.router.navigate(['/user/login']);
      }
      console.log(this.userId);

      this.getAllDocuments();
    }
    this.filteredFiles = [...this.uploadedFiles];
  }

  filterFiles(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredFiles = this.uploadedFiles.filter((file) =>
      file.name.toLowerCase().includes(query)
    );
  }

  getAllDocuments(): void {
    this.couchDbService.getFiles().subscribe({
      next: (response: any) => {
        response.rows.forEach((e: any) => {
          if (e.value._id === this.userId) {
            this.uploadedFiles = e.value.documents.map((doc: any) => ({
              ...doc,
              uploadedDate: new Date(doc.uploadedDate || Date.now()), // Ensure uploadedDate is a Date object
              fileType: doc.fileType || 'unknown', // Ensure fileType is set
            }));
          }
        });
        this.filteredFiles = [...this.uploadedFiles];
      },
      error: (error) => console.log(error),
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files); // Convert FileList to an array
      this.updateUploadButtonText(); // Update button text
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files.length) {
      const files = event.dataTransfer.files;
      this.selectedFiles = Array.from(files); // Convert FileList to an array
      this.updateUploadButtonText(); // Update button text
    }
  }

  updateUploadButtonText(): void {
    this.uploadButtonText = this.selectedFiles.length > 1 ? 'Upload All' : 'Upload File';
  }

  uploadFile(): void {
    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64File = reader.result as string;
          const uploadedDate = new Date(); // Add uploaded date
          const fileType = file.type || file.name.split('.').pop() || 'unknown'; // Add file type

          this.uploadedFiles.push({
            name: file.name,
            file: file,
            base64: base64File,
            uploadedDate: uploadedDate, // Include uploadedDate
            fileType: fileType, // Include fileType
          });

          this.filteredFiles = [...this.uploadedFiles];

          // Display upload message for single or multiple files
          if (this.selectedFiles.length === 1) {
            this.snackBar.open(`✅ File "${file.name}" uploaded successfully!`, 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
          } else {
            this.snackBar.open(`✅  files uploaded successfully!`, 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
          }
        };
        reader.readAsDataURL(file);
      });

      this.selectedFiles = []; // Clear selected files after upload
      this.uploadButtonText = 'Upload File'; // Reset button text
    } else {
      this.uploadMessage = '⚠️ Please select a file before uploading.';
    }
  }

  restoreFile(): void {
    if (this.deletedFiles.length > 0) {
      const lastDeletedFile = this.deletedFiles.pop();
      if (lastDeletedFile) {
        this.uploadedFiles.push({
          name: lastDeletedFile.name,
          file: lastDeletedFile.file,
          base64: lastDeletedFile.base64,
          uploadedDate: lastDeletedFile.uploadedDate,
          fileType: lastDeletedFile.fileType,
        });
        this.filteredFiles = [...this.uploadedFiles];

        this.snackBar.open(`✅ File "${lastDeletedFile.name}" restored successfully!`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
      }
    }
  }

  deleteFile(index: number): void {
    const deletedFile = this.uploadedFiles[index];
    this.deletedFiles.push({ ...deletedFile });

    this.uploadedFiles.splice(index, 1);
    this.filteredFiles = [...this.uploadedFiles];

    const snackBarRef = this.snackBar.open('File deleted!', 'Undo', {
      duration: 5000,
      panelClass: 'snackbar-style',
    });

    snackBarRef.onAction().subscribe(() => {
      this.restoreFile();
    });
    snackBarRef.afterDismissed().subscribe((info) => {
      if (!info.dismissedByAction) {
        this.snackBar.open('❌ File permanently deleted!', 'Close', {
          duration: 3000,
          panelClass: 'snackbar-error',
        });
      }
    });
  }

  sortFiles(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;

    if (selectedValue === 'name') {
      this.uploadedFiles.sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedValue === 'date') {
      this.uploadedFiles.sort((a, b) => a.uploadedDate.getTime() - b.uploadedDate.getTime());
    } else if (selectedValue === 'type') {
      this.uploadedFiles.sort((a, b) => a.fileType.localeCompare(b.fileType));
    }
    this.filteredFiles = [...this.uploadedFiles];
  }

  downloadFile(file: { name: string; base64: string }): void {
    const link = document.createElement('a');
    link.href = file.base64;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open(`✅ File "${file.name}" downloaded successfully!`, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success'],
    });
  }

  editFileName(index: number): void {
    this.renameIndex = index;
    this.newFileName = this.uploadedFiles[index].name;
  }

  saveFileName(index: number): void {
    if (this.newFileName.trim()) {
      this.uploadedFiles[index].name = this.newFileName;
      this.filteredFiles = [...this.uploadedFiles];

      this.snackBar.open(`✏️ File renamed to "${this.newFileName}" successfully!`, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-success'],
      });
    }
    this.renameIndex = null;
  }

  cancelRename(): void {
    this.renameIndex = null;
  }

  viewFile(file: { name: string; file: File; base64: string; uploadedDate: Date; fileType: string }): void {
    this.previewFile = file; // Ensure the file object includes all required properties
    this.isPreviewOpen = true;

    if (file.name.endsWith('.txt')) {
      this.previewTextContent = this.decodeBase64(file.base64);
      this.previewDocxContent = null;
    } else if (file.name.endsWith('.docx')) {
      this.previewDocxContent = null;
      this.extractDocxContent(file.base64);
    } else {
      this.previewTextContent = null;
      this.previewDocxContent = null;
    }
  }

  decodeBase64(base64: string): string {
    return atob(base64.split(',')[1]);
  }

  extractDocxContent(base64: string): void {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers).buffer;
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    // Convert Blob to ArrayBuffer
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result as ArrayBuffer;
      mammoth.extractRawText({ arrayBuffer })
        .then((result) => {
          this.previewDocxContent = result.value; // Set the extracted text content
        })
        .catch((error) => {
          console.error('Error extracting .docx content:', error);
          this.previewDocxContent = 'Unable to display .docx content.';
        });
    };
    fileReader.readAsArrayBuffer(blob);
  }

  closePreview(): void {
    this.isPreviewOpen = false;
    this.previewFile = null;
  }

  navigateToView(): void {
    if (this.previewFile) {
      localStorage.setItem('file', JSON.stringify(this.previewFile));
      this.router.navigate(['/user/view']);
    }
  }
}