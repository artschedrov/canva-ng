import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { ShapeService } from './board/shared/shape.service';
import { TextNodeService } from './board/shared/text-node.service';
//import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    ShapeService,
    TextNodeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
