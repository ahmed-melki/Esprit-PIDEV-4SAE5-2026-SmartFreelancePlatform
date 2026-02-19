import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list-event/list-event.component'
import { CreateComponent } from './create-event/create-event.component';
import { EventEditComponent } from './update-event/update-event.component';




const routes: Routes = [

  // Liste des événements
  { path: 'event', component: ListComponent },

  // Ajouter
  { path: 'event/create', component: CreateComponent },

  { path: 'event/edit/:id', component: EventEditComponent },


  // Redirection par défaut
  { path: '', redirectTo: 'event', pathMatch: 'full' },

  // Si route inconnue
  { path: '**', redirectTo: 'event' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
