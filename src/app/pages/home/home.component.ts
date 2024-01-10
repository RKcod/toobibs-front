import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../api/api.service";
import {NgxSpinnerService} from "ngx-spinner";

declare const $ : any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  adresses: any[] = [];
  location = "";
  proposing = false;
  is_proposing = false;

  constructor(
    public api: ApiService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {

  }

  searchLocation(e){
    console.log(e);
    const f: any = {
      limit: 0,
      queries: "",
      location: this.location+""+e.key
    };
    this.is_proposing = true;
    this.proposing = true;


    this.proposing = false;
    const dr: any[] = [];
    this.adresses = [];
    this.adresses = this.api.searchData(this.location);
    /*this.api.performGETCall("searchusers", f).subscribe(res => {
      //console.log(res);
      this.proposing = false;
      const dr: any[] = [];
      this.adresses = [];
      res.data.forEach(d=> {
        if(!this.adresses.includes(d.address))
          this.adresses.push(d.address);
      });
      console.log("address", this.adresses);

    }, err => {
      this.spinner.hide();
      //console.log(err.error);
      this.api.handleErrors(err.error.message);

    });*/
  }

  setAddress(a: any) {
    this.location = a;
    this.closeProposition();
  }

  closeProposition(){
    this.is_proposing = false;
  }
}
