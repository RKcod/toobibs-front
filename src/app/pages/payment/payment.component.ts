import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ApiService } from "../../api/api.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";

declare const window: any;
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  operator: any;
  phonenumber: any;
  @Input() public amount: any;

  reference: any = null;
  reference_: any = null;

  in_progress = false;
  tel: any = null;

  constructor(public activeModal: NgbActiveModal, public api: ApiService, public router: Router, private spinner: NgxSpinnerService) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      //console.log("initialised");
      var input = document.querySelector("#phone2");
      this.tel = window.intlTelInput(input, {
        initialCountry: "CI",
        preferredCountries: ["ci"],
        utilsScript: "assets/js/utils.js",
      });
    }, 3000);
  }

  countryChange() {
    //console.log("country changed");
    if (this.operator == "ORANGE_CMR" || this.operator == "MTN_CMR") {
      this.tel.setCountry("CM");
    }
    else {
      this.tel.setCountry("CI");
    }
  }

  save() {
    this.spinner.show();
    if (!this.tel.isValidNumber()) {
      this.api.handleErrors("Numéro de téléphone invalide!");
      return;
    }
    else {
      //this.data.phone = this.tel.getNumber().toString().replace("+", "");
      const params = {
        operator_code: this.operator,
        amount: this.amount,
        number: this.tel.getNumber().toString().replace("+", ""), //this.phonenumber.toString(),
        token: "$2y$10$FWCOQBJNS39CsmB76fYj/.CGrpy2N7oXL9M6MVw1FIEAa.DquNRhu",
        have_prefix: true,
        client_reference: new Date().getTime().toString(),
        callback: "https://apitest.toobibs.org/v1/payments"
      };
      this.api.performRemotePOSTCall("https://www.view-pay.com/api/repo/cash/in", params).subscribe(res => {
        this.spinner.hide();
        this.in_progress = true;
        if (res.data.status == "PENDING") {
          this.reference = res.data.reference;
          this.reference_ = params.client_reference;
          setTimeout(() => {
            this.checkTransaction();
          }, 5000);
        }
        else {
          this.api.handleErrors("Une erreur s'est produite!");
        }
        //console.log(res);
      }, err => {
        //console.log(err.error.message);
        this.spinner.hide();
        this.in_progress = false;
        this.api.handleErrors(err.error.message);
      });
    }

  }
  checkTransaction() {
    this.spinner.show();
    this.api.performRemotePOSTCall("https://www.view-pay.com/api/repo/cashin/verify/" + this.reference, null).subscribe(res => {
      //console.log(res);
      this.spinner.hide();
      this.in_progress = true;
      if (res.code == "TP200" || res.code == "T200") {
        //"SUCCESS"
        if (res.data.status == "PENDING" || res.data.status == "WAITING") {
          setTimeout(() => {
            this.checkTransaction();
          }, 5000);
        }
        else if (res.data.status == "FAILURE") {
          this.in_progress = false;
          this.api.handleErrors("Transaction échoué!");
        }
        else {
          this.activeModal.dismiss('success');
        }
      }
      else {
        this.api.handleErrors(res.message);
      }
      //console.log(res);
    }, err => {
      //console.log(err);
      this.spinner.hide();
      this.in_progress = false;
      this.api.handleErrors(err.error.message);
    });
  }
}
