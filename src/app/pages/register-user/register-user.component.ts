import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";


declare const window:any;
@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss']
})
export class RegisterUserComponent implements OnInit {

  data: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    user_type: 'PATIENT',
    password: '',
    password_2: "",
  };
  return_url: any = null;

  tel: any = null;

  constructor(public api: ApiService, public router: Router, private spinner: NgxSpinnerService, public activatedRoute : ActivatedRoute) {

    if (localStorage.getItem("token") != null && this.router.url == "/register") {
      this.router.navigate(["/home"]);
    }

    this.activatedRoute.queryParams.subscribe((params: any) => {
      if(params.return_url != null){
        this.return_url = params.return_url;
        //console.log(this.return_url);
      }
    });
    this.data = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      user_type: 'PATIENT',
      password: ''
    };
  }

  ngOnInit(): void {
    setTimeout(()=>{
      var input = document.querySelector("#phone");
      this.tel = window.intlTelInput(input, {
        initialCountry: "CI",
        utilsScript: "assets/js/utils.js",
      });
    }, 3000);
  }

  signup() {
    if (this.data.first_name.length > 0 && this.data.last_name.length > 0 && this.data.password.length > 0) {

      if(this.data.password == this.data.password_2){
        this.api.handleErrors("Les mots de passes ne correspondent pas");
        return;
      }
      var countryData = this.tel.getSelectedCountryData();
      if (countryData.dialCode != 225 && !this.tel.isValidNumber()) {
        this.api.handleErrors("Numéro de téléphone invalide!");
        return;
      }
      else {
        this.data.phone = countryData.dialCode == 225 ? ( this.tel.getNumber().toString().indexOf("225") != -1 ? this.tel.getNumber().toString().replace("+", "") : "225"+this.tel.getNumber().toString().replace("+", "") ): this.tel.getNumber().toString().replace("+", "");
        this.data.phone_login = this.tel.getNumber().toString().replace("+"+countryData.dialCode, "");
      }
      if (this.data.email.length > 0 && !this.api.isValidEmail(this.data.email)) {
        this.api.handleErrors("Email invalide!");
        this.data.email = null;
        return;
      }
      this.spinner.show();
      /*this.data.client_id = 2;
      this.data.client_secret = "iqn28N849cRfBh14xLpvRF089URio9jh4W7EhVqm";
      this.data.grant_type = "password";
      this.data.scope = "";*/

      this.api.performPOSTCall("register", this.data).subscribe(u => {
        this.spinner.hide();
        //console.log(u);
        this.api.displayMessage("Succès", "Votre compte à été crée avec succès, vous allez devoir activer votre compte.");

        localStorage.setItem('user_activation', JSON.stringify(u.data));
        this.router.navigate(['/activation'], {queryParams :  (this.return_url != null) ? {return_url: this.return_url}: {}});
        /*
        this.api.performPOSTCall('oauth/token', {
          username: this.data.email,
          password: this.data.password,
          client_id: 2,
          client_secret: "iqn28N849cRfBh14xLpvRF089URio9jh4W7EhVqm",
          grant_type: "password",
          scope: ""
        }).subscribe(d => {
          //console.log(d);
          //if(d.error)
          this.api.performGETCall('user/profile', null, true, d.access_token).subscribe(r => {

            this.spinner.hide();
            //console.log(r);
            this.api.displayMessage("Succès", "Authentification réussi, vous serrez rediriger ver le dashboard");
            localStorage.setItem('token', d.access_token);
            localStorage.setItem('user', JSON.stringify(r.data));
            localStorage.setItem('token_data', JSON.stringify(d));
            this.router.navigate(['/home']);


          }, err => {
            this.spinner.hide();
            //console.log(err.error);
            this.api.handleErrors(err.error.message);

          });
        }, error => {
          this.spinner.hide();
          //console.log(error.error);
          this.api.handleErrors(error.error.message);
        });
*/
      }, err => {
        this.spinner.hide();
        //console.log(err.error);
        if(err.error.errors && err.error.errors["email"])
          this.api.handleErrors(err.error.errors["email"]);
        else if(err.error.errors && err.error.errors["phone_login"])
          this.api.handleErrors("Ce numéro de téléphone est déjà utilisé");
        else
          this.api.handleErrors(err.error.message);
      });
    } else {
      this.api.handleErrors("Veuillez remplir tous les champs!!");
    }
  }

}
