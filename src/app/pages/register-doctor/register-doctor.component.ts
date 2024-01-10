import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../api/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";


declare const document: any;
declare const window: any;

@Component({
  selector: 'app-register-doctor',
  templateUrl: './register-doctor.component.html',
  styleUrls: ['./register-doctor.component.scss']
})
export class RegisterDoctorComponent implements OnInit {
  items = [
    {
      src: 'assets/images/help_bg.png',
      altText: 'Nom du docteur 1',
      caption: 'Nom du docteur 1'
    },
    {
      src: 'assets/images/bg-home.png',
      altText: 'Nom du docteur 2',
      caption: 'Nom du docteur 2'
    },
    {
      src: 'assets/images/bg-home.png',
      altText: 'Nom du docteur 3',
      caption: 'Nom du docteur 3'
    }
  ];

  tel: any = null;

  data: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    user_type: 'DOCTOR',
    password: '',
    password_2: "",
    address: '',
    speciality: '',
    doctor_serial_number: '',
    do_teleconsult: false
  };

  doctors: any[] = [];

  return_url: any = null;

  specialities: any[] = [];

  constructor(public api: ApiService, public router: Router, private spinner: NgxSpinnerService, public activatedRoute: ActivatedRoute) {
    if (localStorage.getItem("token") != null && this.router.url == "/register") {
      this.router.navigate(["/home"]);
    }

    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params.return_url != null) {
        this.return_url = params.return_url;
        //console.log(this.return_url);
      }

    });
    this.getSpecialities();
    this.getDoctors();
  }

  ngOnInit(): void {
    setTimeout(() => {
      var input = document.querySelector("#phone");
      this.tel = window.intlTelInput(input, {
        initialCountry: "CI",
        utilsScript: "assets/js/utils.js",
      });
    }, 3000);
  }

  getSpecialities() {
    this.api.performGETCall("specialities", { limit: 0 }).subscribe(res => {
      //console.log(res);
      this.specialities = res.data;
    }, err => {
      //console.log(err.error);
      this.api.handleErrors(err.error.message);
    });
  }

  getDoctors() {
    const f: any = {
      limit: 0,
      search: "display_home:1",
    };
    this.api.performGETCall("users", f).subscribe(res => {
      //console.log(res);
      this.doctors = res.data;
    }, err => {
      //console.log(err.error);
      this.api.handleErrors(err.error.message);
    });
  }

  signup() {
    this.data.do_teleconsult = document.forms.proform.do_teleconsult.value == "true";
    //console.log(this.data);
    if (this.data.first_name.length > 0 && this.data.last_name.length > 0 && this.data.email.length > 0 && this.data.password.length > 0 && this.data.speciality.length > 0 && this.data.address.length > 0 && this.data.doctor_serial_number.length > 0) {

      if (this.data.password == this.data.password_2) {
        this.api.handleErrors("Les mots de passes ne correspondent pas");
        return;
      }

      if (this.data.password.length < 8) {
        this.api.handleErrors("Le mot est incorrect , il doit comporter au moins 8 caractères");
        return;
      }
      var countryData = this.tel.getSelectedCountryData();
      if (countryData.dialCode != 225 && !this.tel.isValidNumber()) {
        this.api.handleErrors("Numéro de téléphone invalide!");
        return;
      } else {
        this.data.phone = countryData.dialCode == 225 ? (this.tel.getNumber().toString().indexOf("225") == -1 ? this.tel.getNumber().toString().replace("+", "") : this.tel.getNumber().toString().replace("+", "")) : this.tel.getNumber().toString().replace("+", ""); //this.tel.getNumber().toString().replace("+", "");
        this.data.phone_login = this.tel.getNumber().toString().replace("+" + countryData.dialCode, "");
      }
      if (!this.api.isValidEmail(this.data.email)) {
        this.api.handleErrors("Email invalide!");
        return;
      }

      this.spinner.show();

      this.api.performPOSTCall("register", this.data).subscribe(u => {
        this.spinner.hide();
        //console.log(u);
        this.api.displayMessage("Succès", "Votre compte à été crée avec succès, vous allez devoir activer votre compte.");

        localStorage.setItem('user_activation', JSON.stringify(u.data));
        this.router.navigate(['/activation']);//, {queryParams :  (this.return_url != null) ? {return_url: this.return_url}: {}});
        //this.router.navigate(['/registered']);

      }, err => {
        this.spinner.hide();
        //console.log(err.error);
        if (err.error.errors["email"])
          this.api.handleErrors(err.error.errors["email"]);
        else if (err.error.errors["phone_login"])
          this.api.handleErrors("Ce numéro de téléphone est déjà utilisé ");
        else
          this.api.handleErrors(err.error.message);
      });


    } else {
      this.api.handleErrors("Veuillez remplir tous les champs!!");
    }

  }
}
