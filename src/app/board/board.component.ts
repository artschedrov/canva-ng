import { Component, OnInit } from '@angular/core';
import Konva from 'konva';
import { ShapeService } from './shared/shape.service';
import { TextNodeService } from './shared/text-node.service';
import { createWorker } from 'tesseract.js';
import * as Tesseract from 'tesseract.js';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  shapes: any = [];
  stage!: Konva.Stage;
  layer!: Konva.Layer;
  selectedButton: any = {
    'circle': false,
    'rectangle': false,
    'line': false,
    'undo': false,
    'erase': false,
    'text': false
  }
  erase: boolean = false;
  transformers: Konva.Transformer[] = [];

  ocrResult = 'Recognizing...';

  filePNG: any;
  finishFile: any;
  link: any;
  constructor(
    private shapeService: ShapeService,
    private textNodeService: TextNodeService
  ) { 
    //this.doOCR();
  }

  // async doOCR() {
  //   const worker = createWorker({
  //     logger: m => console.log(m),
  //   });
  //   await worker.load();
  //   await worker.loadLanguage('eng');
  //   await worker.initialize('eng');
  //   const { data: { text } } = await worker.recognize(this.finishFile!);
  //   this.ocrResult = text;
  //   console.log(text);
  //   await worker.terminate();
  // }

  ngOnInit() {
    let width = window.innerWidth * 0.4;
    let height = window.innerHeight;
    this.stage = new Konva.Stage({
      container: 'container',
      width: 500,
      height: 500
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.addLineListeners();
    let currCanvas = document.querySelector('.konvajs-content');
    console.log(currCanvas?.childNodes[0]);
  }

  recognize() {
    let dataUrl = this.stage.toDataURL();
    localStorage.setItem("raw", dataUrl);
    this.finishFile = localStorage.getItem("raw");
    return Tesseract.recognize(this.finishFile!).then(({data: {text}}) => { return this.ocrResult = text});
  }
  

  clearSelection() {
    Object.keys(this.selectedButton).forEach(key => {
      this.selectedButton[key] = false;
    })
  }

  setSelection(type: string) {
    this.selectedButton[type] = true;
  }

  addShape(type: string) {
    this.clearSelection();
    this.setSelection(type);
    if (type == 'circle') {
      this.addCircle();
    }
    else if (type == 'line') {
      this.addLine();
    }
    else if (type == 'rectangle') {
      this.addRectangle();
    }
    else if (type == 'text') {
      this.addText();
    }
  }

  addText() {
    const text = this.textNodeService.textNode(this.stage, this.layer);
    this.shapes.push(text.textNode);
    this.transformers.push(text.tr);
  }

  addCircle() {
    const circle = this.shapeService.circle();
    this.shapes.push(circle);
    this.layer.add(circle);
    this.stage.add(this.layer);
    this.addTransformerListeners()
  }

  addRectangle() {
    const rectangle = this.shapeService.rectangle();
    this.shapes.push(rectangle);
    this.layer.add(rectangle);
    this.stage.add(this.layer);
    this.addTransformerListeners()
  }

  addLine() {
    this.selectedButton['line'] = true;
  }

  addLineListeners() {
    const component = this;
    let lastLine: any;
    let isPaint: any;
    this.stage.on('mousedown touchstart', function (e) {
      if (!component.selectedButton['line'] && !component.erase) {
        return;
      }
      isPaint = true;
      let pos = component.stage.getPointerPosition();
      const mode = component.erase ? 'erase' : 'brush';
      lastLine = component.shapeService.line(pos, mode)
      component.shapes.push(lastLine);
      component.layer.add(lastLine);
    });
    this.stage.on('mouseup touchend', function () {
      isPaint = false;
    });
    // and core function - drawing
    this.stage.on('mousemove touchmove', function () {
      if (!isPaint) {
        return;
      }
      const position: any = component.stage.getPointerPosition();
      var newPoints = lastLine.points().concat([position.x, position.y]);
      lastLine.points(newPoints);
      component.layer.batchDraw();
    });
  }

  undo() {
    const removedShape = this.shapes.pop();
    this.transformers.forEach(t => {
      t.detach();
    });
    if (removedShape) {
      removedShape.remove();
    }
    this.layer.draw();
  }

  addTransformerListeners() {
    const component = this;
    const tr = new Konva.Transformer();
    // this.stage.on('click', function (e) {
    //   if (!this.clickStartShape) {
    //     return;
    //   }
    //   if (e.target._id == this.clickStartShape._id) {
    //     component.addDeleteListener(e.target);
    //     component.layer.add(tr);
    //     tr.attachTo(e.target);
    //     component.transformers.push(tr);
    //     component.layer.draw();
    //   }
    //   else {
    //     tr.detach();
    //     component.layer.draw();
    //   }
    // });
  }

  addDeleteListener(shape: any) {
    const component = this;
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Delete') {
        shape.remove();
        component.transformers.forEach(t => {
          t.detach();
        });
        const selectedShape = component.shapes.find((s: any) => s._id == shape._id);
        selectedShape.remove();
        e.preventDefault();
      }
      component.layer.batchDraw();
    });
  }

  clearBoard() {
    location.reload();
  }

  downloadURI(uri: string, name: string) {
    let link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete this.link;
  }

  saveToFile() {
    let dataUrl = this.stage.toDataURL();
    localStorage.setItem("raw", dataUrl);
    // 
    this.finishFile = localStorage.getItem("raw");
    //this.downloadURI(dataUrl, 'stage.png');
  }

}