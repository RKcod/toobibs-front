import {Component, Input, OnInit} from '@angular/core';
import * as firebase from  "firebase/app";
import {ApiService} from "../../api/api.service";
import {Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-carreers',
  templateUrl: './carreers.component.html',
  styleUrls: ['./carreers.component.scss']
})
export class CarreersComponent implements OnInit {
//@Input() Carreers: Object[];

  carreers: any = [];
  constructor(public api: ApiService, public router: Router, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getCarreers()
  }
  getCarreers(){
    this.api.getAlldata('carreers').then(res => {
      this.carreers = res;
      //console.log(this.carreers);
    }, err => {
      //console.log(err);
      //this.spinner.hide();
      this.api.handleErrors('Une erreur sest produite');
    });
  }

}
