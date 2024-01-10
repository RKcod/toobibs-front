import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {ApiService} from '../../../api/api.service';
import {NgbCalendar, NgbDate} from '@ng-bootstrap/ng-bootstrap';
import {NgxSpinnerService} from 'ngx-spinner';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';


declare const window: any;
declare const document: any;

@Component({
  selector: 'app-make-prescription',
  templateUrl: './make-prescription.component.html',
  styleUrls: ['./make-prescription.component.scss']
})
export class MakePrescriptionComponent implements OnInit {
  appointment: any = {};
  disabled = true
  user: any = ApiService.getUser();
  draggable = true;
  hours: any;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;

  id: any = null;
  doctor: any = null;
  times: any[] = [];
  tel: any;
  firstDay: Date | null = null;
  lastDay: any = null;

  medicineList: any[] = [];

  prescriptioform: FormGroup;

  constructor(
      private router: Router,
      private fb: FormBuilder,
      private apiService: ApiService,
      private spinner: NgxSpinnerService,
      ) {
    this.appointment = this.router.getCurrentNavigation()?.extras.state;
    if(this.appointment == null){
      this.router.navigate(['/appointments'])
    }
  }

  ngOnInit(): void {
      this.spinner.show();
      this.apiService.performGetRequest('medecines')
          .then((res: any) => {
              this.medicineList = res.data;
              this.spinner.hide();
          }).catch(error => console.log(error))
     //this.hideDropdown();

    console.log(this.appointment)
    setTimeout(() => {
      var input = document.querySelector('#phone');
      this.tel = window.intlTelInput(input, {
        initialCountry: 'CI',
        utilsScript: 'assets/js/utils.js',
      });
      if (this.user != null) {
        this.tel.setNumber('+' + this.user.phone);
      }
    }, 3000);

    this.prescriptioform  = this.fb.group({
      patient: this.fb.group({
        firstName : ['', Validators.required],
        lastName : ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        gender:['', Validators.required],
        profile:['', Validators.required],
        reason:['', Validators.required],
      }),
      medicines : this.fb.array([this.addMedecineFormGroup()])
    });

    let patient = this.prescriptioform.get('patient');
    patient?.get('firstName')?.setValue(this.appointment.first_name);
    patient?.get('lastName')?.setValue(this.appointment.last_name);
    patient?.get('email')?.setValue(this.appointment.email);
    patient?.get('phone')?.setValue(this.appointment.phone);

    for (const medicine of this.medicines.controls) {
      this.autocomplete(document.getElementsById("myInput" + medicine), this.medicineList);
    }
  }

  get medicines(){ return this.prescriptioform.get('medicines') as FormArray;  }

  addMedicine(): void{
    this.medicines.push(this.addMedecineFormGroup());
  }

  removeMedicineAtIndex(index:number): void {
    this.medicines.removeAt(index);
  }

  removeLastMedicine(): void {
    this.medicines.removeAt(this.medicines.length - 1);
  }

  createRange(number){
    let items: any[] = [];
    for(var i = 1; i <= number; i++){
      items.push(i);
    }
    return items;
  }

  addMedecineFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      duration: this.fb.group({
        number: ['', Validators.required],
        unit: ['', Validators.required],
      }),
      date_first_taken: [''],
      quantity: ['', Validators.required],
      frequency: [''],
      time_of_intake: [''],
      renewal_date: [''],
      other_precisions: [''],
    })
  }

  async getFormdata(){
    const medicinesArray = this.prescriptioform.get('medicines') as FormArray;
    const medicinesValue = medicinesArray.value;
  
    const formData = await this.prescriptioform.value;
    let prescription_id: any = null;
    const requestBody = {
      doctor_id: ApiService.getUser().real_id,
      user_id: this.appointment.users_id,
      appointment_id: this.appointment.real_id,
      first_name: formData.patient.firstName,
      last_name:formData.patient.lastName,
      email: formData.patient.email,
      phone: formData.patient.phone,
      gender: formData.patient.gender,
      profile: formData.patient.profile,
      reason: formData.patient.reason,
    }
    const $this: any = this;

    this.spinner.show();
    this.apiService.performPostRequest('prescriptions', requestBody)
        .then(async function(res: any) {
          prescription_id = res.data.real_id;
          for (let medicine of medicinesValue ){
            let drug = await $this.saveMedicine(medicine);
            await $this.apiService.performPostRequest('prescription_medecines',{
              ...medicine,
              prescription_id,
              medicine_id: drug.real_id,
              duration: medicine.duration.number + ' ' + medicine.duration.unit
            })
          }
        }).then(()=>{
      this.spinner.hide();
      console.log('successfully saved')
      this.router.navigate(['/appointments'])
    }).catch(error=>{
      console.log(error);
    })
  }

  async saveMedicine({name, type}){
    let  medicine;
    await this.apiService.performPostRequest('medecines', {
      name,
      type
    }).then((res: any) => { medicine = res.data });
    return medicine;
  }

  setValue(index:number, medicine:any){
    this.medicines?.at(index)?.get('name')?.setValue(medicine.name)
    this.medicines?.at(index)?.get('type')?.setValue(medicine.type)
  }

  autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    let currentFocus: any;
    const $this: any = this;

    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e: any) {
        var a: any, b: any, i: any, val: any = $this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists(null);
        // if (!val) { return false;}
        if (!val) { return;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", $this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        $this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = $this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists(null);
            });
            a.appendChild(b);
          }
        }
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById($this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });

    function addActive(x: any) {
      /*a function to classify an item as "active":*/
      // if (!x) return false;
      if (!x) return;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }

    function closeAllLists(elmnt: any) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }

    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
      closeAllLists(e.target);
    });
  }
}
