import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../api/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  data: any = {
    username: '',
    password: ''
  };

  return_url: any = null;

  constructor(public api: ApiService, public router: Router, private spinner: NgxSpinnerService, public activatedRoute : ActivatedRoute) {

    if(localStorage.getItem("token") != null && localStorage.getItem("user") != null && this.router.url == "/login"){
      this.router.navigate(["/dashboard"]);
    }

    this.activatedRoute.queryParams.subscribe((params: any)=> {
      if(params.return_url != null){
        this.return_url = params.return_url;
        //console.log(this.return_url);
      }

    });
  }

  ngOnInit(): void {

    localStorage.removeItem("validation_code");
    localStorage.removeItem("user_activation");
  }

  login() {
    if (this.data.username.length > 0 && this.data.password.length > 0) {
      this.spinner.show();
      this.data.client_id = 2;
      this.data.client_secret = "iqn28N849cRfBh14xLpvRF089URio9jh4W7EhVqm";
      this.data.grant_type = "password";
      this.data.scope = "";
      this.api.performPOSTCall('oauth/token', this.data).subscribe(d => {
        this.spinner.hide();
        //console.log(d);
        //if(d.error)
        this.api.performGETCall('user/profile', null, true, d.access_token).subscribe(r => {
          //console.log(r);
          this.spinner.hide();
          if(r.data.user_type != "ADMIN"){
            if(r.data.user_type == "DOCTOR" && r.data.confirmed == 0){
              this.api.handleErrors("Votre compte n'a pas encore été vérifié");
              //localStorage.setItem('token', d.access_token);
              localStorage.setItem('user_activation', JSON.stringify(r.data));
              this.router.navigate(["/activation"]);
            }
            else if(r.data.user_type == "DOCTOR" && r.data.confirmed == 4){
              this.api.handleErrors("Votre compte n'a pas encore été approuvé par l'administrateur");
            }
            else if(r.data.user_type == "DOCTOR" && r.data.confirmed == 2){
              this.api.handleErrors("Votre compte n'a pas été approuvé par l'administrateur");
            }
            else{
              if(r.data.confirmed == 0){
                this.api.handleErrors("Votre compte n'a pas encore été vérifié");
                //localStorage.setItem('token', d.access_token);
                localStorage.setItem('user_activation', JSON.stringify(r.data));
                this.router.navigate(["/activation"]);
              }else if(r.data.status == 0) {
                this.api.handleErrors("Votre compte a été bloqué par l'administrateur veuillez le contacter pour plus d'informations.");
              }else{
                this.api.displayMessage("Succès", "Authentification réussi, vous serez redirigé vers le dashboard");
                let date_ = new Date();
                let t = date_.getTime() + d.expires_in;
                localStorage.setItem('token', d.access_token);
                localStorage.setItem('expires', t+"");
                localStorage.setItem('user', JSON.stringify(r.data));
                localStorage.setItem('token_data', JSON.stringify(d));
                if(this.return_url != null)
                  this.router.navigate([this.return_url]);
                else
                  this.router.navigate(['/home']);
              }

            }

          }
          else {
            this.api.handleErrors("Les administrateurs ne sont pas autorisé à se connecter sur cette plateforme");
          }


        }, err => {
          this.spinner.hide();
          //console.log(err.error);
          this.api.handleErrors(err.error.message);

        });
      }, error => {
        this.spinner.hide();
        //console.log(error.error);
        this.api.handleErrors("Email/téléphone ou Mot de passe incorrect, veuillez réessayer s’il vous plaît");
      });
    }
    else {
      this.api.handleErrors("Veuillez remplir tous les champs!!");
    }
  }

}
