// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ArticleListComponent } from './article-list/article-list.component';
import { ArticleAddComponent } from './article-add/article-add.component';
import { ArticleUpdateComponent } from './article-update/article-update.component';
import { ReportComponent } from './report/report.component';
import { ArticleListfrontComponent } from './article-listfront/article-listfront.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';



export const routes: Routes = [
  { path: '', component: ArticleListComponent },
   { path: 'articles', component: ArticleListfrontComponent },
    { path: 'article/:id', component: ArticleDetailComponent },
  { path: 'add', component: ArticleAddComponent },
  { path: 'edit/:id', component: ArticleUpdateComponent },
  { path: 'report/:id', component: ReportComponent } ,
  
  { path: '**', redirectTo: '' }  // Redirection si aucune route ne correspond
];