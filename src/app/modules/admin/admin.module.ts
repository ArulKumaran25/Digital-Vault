import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { FormsModule } from '@angular/forms';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

@NgModule({
  declarations: [
   AdminDashboardComponent
  ],
  imports: [
    AdminRoutingModule,
    FormsModule,
    CommonModule
  ],
  exports: [
    AdminRoutingModule,
    AdminDashboardComponent
  ]
})
export class AdminModule { }
