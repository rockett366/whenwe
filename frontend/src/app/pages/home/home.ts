import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { RouterLink } from '@angular/router'; // Import if using standalone component
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, RouterLink, MatTooltipModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  titleBase = 'WhenWe';
  rotatingWords = ['Meet', 'Hangout', 'Connect'];
  currentWordIndex = 0;
  currentWord = this.rotatingWords[0];
  intervalId: any;

  ngOnInit() {
    // Rotate words every 3 seconds
    this.intervalId = setInterval(() => {
      this.currentWordIndex = (this.currentWordIndex + 1) % this.rotatingWords.length;
      this.currentWord = this.rotatingWords[this.currentWordIndex];
    }, 2000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId); // clean up interval
  }
}
