import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './shared/header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'] // ✅ corrigé
    ,
    standalone: true,
    imports: [HeaderComponent, RouterOutlet, FooterComponent]
})
export class AppComponent implements OnInit {
  title = 'projetpi';

  ngOnInit() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
      loader.classList.add('global-loader-fade-out');
      setTimeout(() => {
        loader.classList.add('global-loader-hidden');
      }, 500); // correspond à la transition CSS
    }
  }
}
