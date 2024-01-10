import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../api/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  data = {
    password: "",
    password_2: "",
    email: null,
    token: null
  };


  constructor(public api: ApiService, public router: Router, private spinner: NgxSpinnerService, public activatedRoute : ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.data.email = params.email;
      this.data.token = params.token;
    });
  }

  changeP() {
    if (this.data.password.length > 7 && this.data.password_2.length > 7 && this.data.email != null && this.data.token != null) {
      if(this.data.password == this.data.password_2){
        this.spinner.show();
        this.api.performPOSTCall('password/reset', this.data).subscribe(d => {
          this.spinner.hide();
          this.api.displayMessage("Succès", "Mot de passe enregistré avec succès.");
          this.router.navigate(['/login']);
          //console.log(d);

        }, err => {
          this.spinner.hide();
          //console.log(err.error);
          this.api.handleErrors(err.error.message);

        });
      }
      else {
        this.api.handleErrors("Les mots de passes ne correspondent pas");
      }
    } else {
      this.api.handleErrors("Veuillez remplir tous les champs!!");
    }
  }
}
