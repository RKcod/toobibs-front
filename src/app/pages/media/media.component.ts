import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";


@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {
  @Input() Media: object[];

  medias: any[] = [];
  constructor(public api: ApiService, public router: Router, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
  this.getMedia();
  }

  getMedia() {
    this.api.getAlldata('media').then(res => {
      this.medias = res;
      //console.log(this.medias);
    }, err => {
      //console.log(err);
      //this.spinner.hide();
      this.api.handleErrors('Une erreur sest produite');
    });

  }
}
