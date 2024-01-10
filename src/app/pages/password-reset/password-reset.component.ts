import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  data = {
    email: "",
    reseturl: "password-reset",
    field: ""
  };

  constructor(public api: ApiService, public router: Router, private spinner: NgxSpinnerService, public activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
  }

  resetP() {
    if (this.data.email.length > 0) {
      this.spinner.show();
      if(this.api.isValidEmail(this.data.email)){
        this.data.field = "email";
      }
      else {
        this.data.field = "phone_login"
      }
      console.log(this.data)
      this.api.performPOSTCall('password/forgot', this.data).subscribe(d => {
        this.spinner.hide();
        console.log(d);
        if(this.data.field == "email")
          this.api.displayMessage("Succès", "Un lien vous a été envoyé par mail pour réinitialiser votre mot de passe.");
        else {
          localStorage.setItem("user_password", JSON.stringify(d.user));
          this.router.navigate(["/change-password-phone"], {queryParams: {token: d.token}});
        }
      }, err => {
        this.spinner.hide();
        //console.log(err.error);
        if(this.data.field == "email"){
          this.api.handleErrors("Email invalide ou inconnu, veuillez réessayer");
        }
        else {
          this.api.handleErrors("Numéro de téléphone invalide ou inconnu, veuillez réessayer");
        }


      });
    } else {
      this.api.handleErrors("Veuillez remplir tous les champs!!");
    }
  }
}
