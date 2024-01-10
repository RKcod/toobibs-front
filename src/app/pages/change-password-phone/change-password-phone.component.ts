import {Component, OnInit, ViewChild} from '@angular/core';
import { CountdownComponent, CountdownConfig, CountdownEvent } from "ngx-countdown";
import { ApiService } from "../../api/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";

const api_sent="https://api-mapper.clicksend.com/http/v2/send.php?method=http&username=yankouek@yahoo.fr&key=13929160-1795-068C-AADC-DF45FC440DD7&to=";
const encoded=encodeURI(api_sent);

@Component({
  selector: 'app-change-password-phone',
  templateUrl: './change-password-phone.component.html',
  styleUrls: ['./change-password-phone.component.scss']
})
export class ChangePasswordPhoneComponent implements OnInit {

  @ViewChild('cd') public countdown: CountdownComponent;
  data = {
    code : ""
  };

  token = "";
  generated = "";

  return_url = null;

  user: any = JSON.parse(localStorage.getItem("user_password") || '{}');
  resend = false;
  config: CountdownConfig = {
    demand: true,
    leftTime: 60,
    format: "mm:ss"
  };
  constructor(public api: ApiService, public router: Router, private spinner: NgxSpinnerService, public activatedRoute: ActivatedRoute) {

    this.activatedRoute.queryParams.subscribe((params: any)=> {
      if(params.return_url != null){
        this.return_url = params.return_url;
        //console.log(this.return_url);
      }
      if(params.token != null) {
        this.token = params.token;
      }
      else {
        router.navigate(["/login"]);
      }

    });
  }

  ngOnInit(): void {
    /*if(localStorage.getItem("validation_code") != null)
      this.generated = localStorage.getItem("validation_code");
    else*/
    this.generated = this.api.generateNumericCode();
    console.log(this.generated)
  }
  ngAfterViewInit(): void {
    //console.log('This event fire after the content init have been loaded!');
    //this.countdown.begin();
    this.sendSMS();
  }
  sendSMS(){
    let message = "Bonjour "+ this.user.first_name + ", le code de vérification est : "+ this.generated;
    this.api.performRemoteGETCall(decodeURI(encoded) + this.user.phone + "&source=Toobibs&message=" +encodeURI(message)).subscribe(res => {
      // this.api.displayMessage("Succès", "Le code de vérification à bien été envoyer");
      console.log("response",res);
    }, err => {
      //console.log(err);
      //this.api.handleErrors(err.error.message);
    });
  }

  activateAccount() {
    if(this.data.code.length > 0){
      if(this.data.code == this.generated){
        //this.spinner.show();
        this.router.navigate(["/password-reset"], {queryParams: {token: this.token, email: this.user.email}});
        /*this.api.performPUTCall('activation/'+this.user.id, {confirmed: this.user.user_type=="DOCTOR" ? 4: 1}, false, false).subscribe(d => {
          this.spinner.hide();
          //console.log(d);
          this.api.displayMessage("Succès", "Votre compte a été vérifié avec succès");
          localStorage.removeItem("user_activation");
          localStorage.removeItem("token");
          if(this.user.user_type=="DOCTOR")
            this.router.navigate(['/registered']);
          else
            this.router.navigate(["/login"], {queryParams :  (this.return_url != null) ? {return_url: this.return_url}: {}});
        }, err => {
          this.spinner.hide();
          //console.log(err.error);
          this.api.handleErrors(err.error.message);

        });*/
      }
      else {
        this.api.handleErrors("Le code ne correspond pas à celui envoyé!!");
      }
    }
    else {
      this.api.handleErrors("Veuillez remplir tous les champs!!");
    }
  }

  handleEvent($event: CountdownEvent) {
    if($event.left == 0){
      this.resend = true;
      this.countdown.stop();
    }
  }

  resendCode() {
    this.resend = false;
    setTimeout(()=> {
      this.countdown.restart();
      this.countdown.begin();
    }, 300);
    this.sendSMS();
  }

}
