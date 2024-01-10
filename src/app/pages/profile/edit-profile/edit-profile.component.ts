import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../../api/api.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { EventDetailsComponent } from "../../calendar/event-details/event-details.component";
import { DocumentsComponent } from "../../documents/documents.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmDeleteMetaComponent } from "./confirm-delete-meta/confirm-delete-meta.component";
declare const document: any;

declare const window: any;
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  selectedAddressId: string;
  selectedAddressName: string;

  active = 'top';
  address_name = '';
  profile = '';
  address = "";
  data: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    user_type: 'DOCTOR',
    address: '',
    speciality: '',
    doctor_serial_number: '',
    do_teleconsult: false
  };

  page: number = 1;
  count: number = 0;
  tableSize: number = 7;
  tableSizes: any = [3, 6, 9, 12];

  data_prices: any = {
    price_cabinet_consultation: 0.0,
    price_house_consultation: 0.0,
    price_teleconsultation: 0.0,
    currency: 'XAF'
  };

  password = "";
  specialities: any[] = [];

  user: any = ApiService.getUser();
  private fileToUpload: File|null = null;
  private imgBlob: any = null;

  tel: any = null;
  usermetas: any[] = [];
  public otherAddresses: FormGroup;

  addressList: any[] = [];

  constructor(private modalService: NgbModal, public api: ApiService, public router: Router, private spinner: NgxSpinnerService, private fb: FormBuilder) {
  }

  ngOnInit(): void {



    //this.getSpecialities();
    setTimeout(() => {
      var input = document.querySelector("#phone");
      this.tel = window.intlTelInput(input, {
        initialCountry: "CI",
        utilsScript: "assets/js/utils.js",
      });
      this.tel.setNumber("+" + this.user.phone);
    }, 3000);

    this.profile = this.api.WEB_BASED_URL + this.user.profile_picture;
    this.data = {
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      email: this.user.email,
      phone: this.user.phone,
      gender: this.user.gender,
      address: this.user.address,
      speciality: this.user.speciality,
      doctor_serial_number: this.user.doctor_serial_number,
      do_teleconsult: this.user.do_teleconsult
    };
    this.otherAddresses = this.fb.group(
      {
        addresses: this.fb.array([])
        //addresses: this.fb.array([this.fb.control(this.data.address)])
      }
    );
    console.log('address', this.addresses.controls);
    if (this.user.user_type == 'DOCTOR') {
      this.getSpecialities();
      this.loadSettings();
      this.loadUserMetas();
      this.getAddress();
    }

    if (this.addressList.length > 0) {

    }

  }

  addAddress() {
    let addresses = this.otherAddresses.get('addresses') as FormArray;
    addresses.push(this.fb.control(''))
    //this.addresses.push(this.fb.control(addresses?.addresses))
  }

  get addresses() {
    return this.otherAddresses.get('addresses') as FormArray;
  }

  getSpecialities() {
    this.api.performGETCall("specialities", null).subscribe(res => {
      //console.log(res);
      this.specialities = res.data;
    }, err => {
      //console.log(err.error);
      this.api.handleErrors(err.error.message);
    });
  }

  save() {
    console.log("Nom de l'adresse sélectionnée :", this.selectedAddressName);
    //console.log(this.data);

    let go = false;
    if (this.data.first_name.length > 0 && this.data.last_name.length > 0) {
      //this.data.gender = document.forms.proform.sexe.value;
      var countryData = this.tel.getSelectedCountryData();
      if (countryData.dialCode != 225 && !this.tel.isValidNumber()) {
        this.api.handleErrors("Numéro de téléphone invalide!");
        return;
      }
      else {
        this.data.phone = countryData.dialCode == 225 ? (this.tel.getNumber().toString().indexOf('225') != -1 ? this.tel.getNumber().toString().replace('+', '') : '225' + this.tel.getNumber().toString().replace('+', '')) : this.tel.getNumber().toString().replace('+', '');
      }
      if (!this.api.isValidEmail(this.data.email)) {
        this.api.handleErrors("Email invalide!");
        return;
      }
      if (this.password.length > 7) {
        this.data.password = this.password;
      } else {
        if (this.data.password != undefined)
          delete this.data.password;
      }
      if (this.user.user_type == 'DOCTOR') {
        this.data.do_teleconsult = document.forms.proform.do_teleconsult.value == "true";
        go = this.data.speciality != "" && this.data.doctor_serial_number.length > 0 && this.data.address.length > 0;
        if (!go)
          this.api.handleErrors("Veuillez remplir tous les champs!!");
      } else {
        go = true
      }
      if (go) {
        this.spinner.show();
        const formData = this.api.getFormData(this.data);
        if (this.fileToUpload != null) {
          //console.log("file to upload");

          this.data.profile = this.imgBlob;
          this.data.imageExtension = this.fileToUpload.name.slice((this.fileToUpload.name.lastIndexOf(".") - 1 >>> 0) + 2);
          //formData.append('profile', this.imgBlob, this.fileToUpload.name);
          //formData.append('imageExtension', this.fileToUpload.name.slice((this.fileToUpload.name.lastIndexOf(".") - 1 >>> 0) + 2));
          //this.product.imageName = this.form.get('proof').value.name;
          //this.product.imageExtension = this.form.get('proof').value.name.slice((this.product.imageName.lastIndexOf(".") - 1 >>> 0) + 2);

          this.doSave(formData);
        }
        else {
          this.data.profile = this.data.profile;
          if (this.selectedAddressName != undefined || this.selectedAddressName != null) {
            this.data.address = this.selectedAddressName;
          }
          this.doSave(formData)
        }
      }


    } else {
      this.api.handleErrors("Veuillez remplir tous les champs!!");
    }

  }

  filterMeta(type) {
    const res: any[] = [];
    this.usermetas.forEach((meta: any) => {
      if (meta.type == type)
        res.push(meta);
    });
    return res;
  }

  loadUserMetas() {
    this.spinner.show();
    this.api.performGETCall("usermetas", { search: "doctor_id:" + this.user.real_id }, true).subscribe(res => {
      //console.log("user metas : ",res);
      this.spinner.hide();
      this.usermetas = res.data;
    }, err => {
      this.spinner.hide();
      this.api.handleErrors(err.error.message);
    });
  }

  doSave(formData) {
    this.api.performPUTCall("users/" + this.user.id, this.data, false, true).subscribe(u => {
      this.spinner.hide();
      //console.log(u);
      localStorage.setItem("user", JSON.stringify(u.data));
      this.api.displayMessage("Succès", "Informations mise à jour");
      window.location.reload();

    }, err => {
      this.spinner.hide();
      //console.log(err.error);
      this.api.handleErrors(err.error.message);
    });
  }

  savePrices() {
    if (this.data_prices.price_cabinet_consultation > 0 && this.data_prices.price_house_consultation) {
      this.spinner.show();
      this.api.performPUTCall("prices/" + this.data_prices.id, this.data_prices, false, true).subscribe(res => {
        //console.log("user metas : ", res);
        this.spinner.hide();
        this.data_prices = res.data;
      }, err => {
        this.spinner.hide();
        this.api.handleErrors(err.error.message);
      });
    } else {
      this.api.handleErrors("Veuillez remplir tous les champs!!");
    }
  }


  loadSettings() {
    this.api.performGETCall("prices", { search: "doctor_id:" + this.user.real_id }, true).subscribe(res => {
      //console.log("settings :  : ", res);
      this.spinner.hide();
      this.data_prices = res.data[0];
      /*this.setting_data.fees = this.settings.fees;
      this.setting_data.fees_type = this.settings.fees_type;
      this.setting_data.currency = this.settings.currency;
      this.data_prices.price_cabinet_consultation = res.data[0].price_cabinet_consultation;
      this.data_prices.price_teleconsultation = res.data[0].price_teleconsultation;
      this.data_prices.price_house_consultation = res.data[0].price_house_consultation;*/
    }, err => {
      this.spinner.hide();
      this.api.handleErrors(err.error.message);
    });
  }

  onFileChange(event) {

    this.fileToUpload = event.target.files.item(0);
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      /*this.imgBlob = new Blob([reader.result], {
        type: this.fileToUpload.type
      });*/
      reader.onload = () => {
        this.profile = reader.result as string;
        this.imgBlob = reader?.result?.toString().split(',')[1];
      };

    }
  }

  open(type, id) {
    const $this = this;
    const modalRef = this.modalService.open(DocumentsComponent, { ariaLabelledBy: 'modal-basic-title', windowClass: 'doc' });
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.id = id;
    modalRef.result.then((result) => {
      //this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      if (reason == "saved")
        this.loadUserMetas();
      //$this.getData();

    });
    // modalRef
  }

  openDelete(id) {
    const $this = this;
    const modalRef = this.modalService.open(ConfirmDeleteMetaComponent, { ariaLabelledBy: 'modal-basic-title', windowClass: 'doc' });
    modalRef.componentInstance.id = id;
    modalRef.result.then((result) => {
      //this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      if (reason == "deleted")
        this.loadUserMetas();
      //$this.getData();

    });
  }

  saveAddress() {
    if (this.address_name.length > 0 && this.address_name != '') {
      this.api.performPostRequest('address', {
        address: this.address_name,
        doctor_id: this.user.real_id
      }).then(() => {
        this.ngOnInit();
        this.api.displayMessage("Succès", "Votre addresse a bien été enregistrée")
      })
        .catch((error) => console.error(error))
    }

    this.address_name = '';

  }

  onDelete(id) {
    this.api.performDELETECall("address/" + id, true).subscribe(res => {
      this.api.displayMessage("Succès", "Address supprimée avec succès");
      this.ngOnInit();
    }, err => {
      this.api.handleErrors(err.error.message);
    });
  }

  getAddress() {
    this.api.performGetRequest('address?search=doctor_id:' + this.user.real_id + '&limit=550')
      .then((response: any) => {
        // this.addressList = addresses
        console.log(response.data);
        // for (let address of response.data) {
        //   if (address?.address == this.data.address) {
        //     continue;
        //   }
        //   this.addresses.push(this.fb.control(address?.address))
        // }
        this.addressList = response.data;
      })
  }

  onAddressSelected(selectedAddressId: string) {
    // Rechercher l'adresse sélectionnée dans addressList
    const selectedAddress = this.addressList.find(address => address.real_id === selectedAddressId);

    if (selectedAddress) {
      // Récupérer le nom de l'adresse sélectionnée
      this.selectedAddressId = selectedAddressId;
      this.selectedAddressName = selectedAddress.address;
      // Vous pouvez ajouter votre logique personnalisée ici
    }

  }




}
