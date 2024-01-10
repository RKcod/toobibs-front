import { Component,ViewChild,OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/api/api.service';
import { FormControl } from '@angular/forms';
class User {
  address: string;
  phone:string;
 
}

interface UserS {
  object: string;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone:string
  // Add other properties here if needed
}
const api_sent="https://api-mapper.clicksend.com/http/v2/send.php?method=http&username=yankouek@yahoo.fr&key=13929160-1795-068C-AADC-DF45FC440DD7&to=";
@Component({
  selector: 'app-relaunch',
  templateUrl: './relaunch.component.html',
  styleUrls: ['./relaunch.component.scss']
})
export class RelaunchComponent implements OnInit  {
  // Variables to store form values
  static encoded = encodeURI(api_sent);
  patientName: string = '';
  patientNumber: string = '';
  availabilityDate: string = '';
  relanceType: string = '';
  price:number=0;
  user: User = new User();
  options: UserS[] = [];
  filteredOptions: UserS[] = [];
  @ViewChild('modalContent') modalContent: any;
  @ViewChild('modalContent1') modalContent1: any;
  constructor(private modalService: NgbModal, private apiservice:ApiService) {}

  openModal() {
    this.modalService.open(this.modalContent);
  }

  openModal1() {
    this.modalService.open(this.modalContent1);
  }

  ngOnInit() {
     // Retrieve the user object from Local Storage
     const userStr = localStorage.getItem('user');

     // Parse the JSON string back into an object
     if (userStr) {
       this.user = JSON.parse(userStr);
     }

     this.apiservice.performGETCall("users?search:usertype=patient",{orderBy:"first_name",include:"center", limit: 500}).subscribe(res=>{
      console.log(res.data)
          this.options = res.data;
          this.filteredOptions = this.options; 
     } ,err => {
      //console.log(err.error);
      this.apiservice.handleErrors(err.error.message);

    });
    
  }

  patientNameControl = new FormControl();

  filterOptions(event: any) {
    const inputValue = event.target.value.toLowerCase();
    this.filteredOptions = this.options.filter((option: UserS) =>
      option.first_name.toLowerCase().includes(inputValue)
    );
  }

  displayFn(option: any): string {
    return option ? option.first_name : '';
  }

  onSubmit() {
    let message="";
    if (
      this.patientName.trim() === '' ||
      this.availabilityDate.trim() === '' ||
      this.relanceType.trim() === '' ||
      this.user.phone.trim() === '' ||
      this.user.address.trim() === '' ||
      this.patientNumber.trim() === ''
    ) {
        this.apiservice.displayMessageError("erreur","Veillez renseigné tous les champs svp.")
    }else{
        if(this.relanceType == "Résultat analyse"){
            message = "Bonjour  "+this.patientName+", nous avons vos résultats d'analyse disponible. Merci de nous contacter au "+this.user.phone+" ou de passer récupérer le "+this.availabilityDate+" au centre "+this.user.address+"."
        }else if (this.relanceType == "Lunettes"){
            message = "Bonjour  "+this.patientName+" ,vos lunettes sont disponible. Merci de nous contacter au "+this.user.phone+" ou de passer récupérer le "+this.availabilityDate+" au centre "+this.user.address+" pour sa pose."
        }else{
          message = "Bonjour  "+this.patientName+" , votre prothèse dentaire est prête. Merci de nous contacter au "+this.user.phone+" ou de passer récupérer le "+this.availabilityDate+" au centre "+this.user.address+"."
        }

       this.apiservice.performRemoteGETCall(decodeURI(api_sent)+this.patientNumber + "&source=Toobibs&message=" +encodeURI(message)).subscribe(res=>{
         this.apiservice.displayMessage("Succès","Votre message a été bien envoyé à votre patient.")
       }, err => {
        this.apiservice.displayMessage("Succès","Votre message a été bien envoyé à votre patient.")
      });
      this.modalService.dismissAll();
    }
    // // Close the modal after submitting the form
    // this.modalService.dismissAll();
  }

  onSubmit1() {
    let message="";
    if (
      this.patientName.trim() === '' ||
      this.price === 0 ||
      this.user.phone === '' ||
      this.user.address.trim() === '' ||
      this.patientNumber.trim() === ''
    ) {
        this.apiservice.displayMessageError("erreur","Veillez renseigné tous les champs svp.")
    }else{
        message = "Bonjour "+this.patientName+", sauf erreur de notre part vous devez nous régler la somme de "+this.price+" FCFA ,Rendez-vous au centre "+this.user.address+" pour le paiement en liquide. Veillez nous appeler au "+this.user.phone
       this.apiservice.performRemoteGETCall(decodeURI(api_sent)+this.patientNumber + "&source=Toobibs&message=" +encodeURI(message)).subscribe(res=>{
         this.apiservice.displayMessage("Succès","Votre message a été bien envoyé à votre patient.")
       }, err => {
        this.apiservice.displayMessage("Succès","Votre message a été bien envoyé à votre patient.")
      });
      this.modalService.dismissAll();
    }
    // // Close the modal after submitting the form
    // this.modalService.dismissAll();
  }
}
