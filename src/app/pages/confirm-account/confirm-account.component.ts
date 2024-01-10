import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { ApiService } from "../../api/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";
import {CountdownComponent, CountdownConfig, CountdownEvent} from "ngx-countdown";
const api_sent="https://api-mapper.clicksend.com/http/v2/send.php?method=http&username=yankouek@yahoo.fr&key=13929160-1795-068C-AADC-DF45FC440DD7&to=";
@Component({
  selector: 'app-confirm-account',
  templateUrl: './confirm-account.component.html',
  styleUrls: ['./confirm-account.component.scss']
})
export class ConfirmAccountComponent implements OnInit, AfterViewInit {
  static encoded = encodeURI(api_sent);
  // @ViewChild('cd') public countdown: CountdownComponent;
  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;

  data = {
    code : ""
  };

  generated = "";
  return_url: any = null;

  user: any = JSON.parse(localStorage.getItem("user_activation") || '{}');
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
    });
  }

  ngOnInit(): void {
    /*if(localStorage.getItem("validation_code") != null)
      this.generated = localStorage.getItem("validation_code");
    else*/
      this.generated = this.api.generateNumericCode();
  }
  ngAfterViewInit(): void {
    //console.log('This event fire after the content init have been loaded!');
    this.countdown.begin();
    this.sendSMS();
  }
  sendSMS(){
    let message = "Bonjour "+ this.user.first_name + ", le code de vérification est : "+ this.generated;
    this.api.performRemoteGETCall(decodeURI(api_sent)+ this.user.phone + "&source=Toobibs&message=" +encodeURI(message)).subscribe(res => {
      //this.api.displayMessage("Succès", "Le code de vérification à bien été envoyer");
      console.log(res);
    }, err => {
      console.log(err);
      //this.api.handleErrors(err.error.message);
    });
  }

  activateAccount() {
    if(this.data.code.length > 0){
      if(this.data.code == this.generated){
        this.spinner.show();
        this.api.performPUTCall('activation/'+this.user.id, {confirmed: this.user.user_type=="DOCTOR" ? 4: 1}, false, false).subscribe(d => {
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

        });
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
