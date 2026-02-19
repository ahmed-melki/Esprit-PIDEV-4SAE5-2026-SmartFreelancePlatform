import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { CreateComponent } from './create-event/create-event.component';
import { ListComponent } from './list-event/list-event.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventEditComponent } from './update-event/update-event.component';




@NgModule({
  declarations: [
    AppComponent,
    CreateComponent,
    ListComponent,
    DashboardComponent,
    EventEditComponent 
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }
