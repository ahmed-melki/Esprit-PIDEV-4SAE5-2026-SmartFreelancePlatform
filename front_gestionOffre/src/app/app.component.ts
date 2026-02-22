import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // ✅ corrigé
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
