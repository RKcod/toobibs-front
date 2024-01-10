import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../../../api/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

declare const window;
declare const document;


@Component({
  selector: 'app-prescription-detail',
  templateUrl: './prescription-detail.component.html',
  styleUrls: ['./prescription-detail.component.scss']
})
export class PrescriptionDetailComponent implements OnInit {
  @ViewChild('prescription') prescriptionDiv: ElementRef;
  prescription: any;
  id: any;
  isButtonVisible = true;
  isTouched = false;
  constructor(
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private activeRoute: ActivatedRoute,
  ) { }

  async ngOnInit() {
    this.spinner.show();
    this.id = await this.activeRoute.snapshot.params['id']

    await this.apiService.performGetRequest(
      'prescriptions/' + this.id + '?include=user, doctor, prescribed&search=doctor_id:' + ApiService.getUser().real_id
    ).then((res: any): void => {
      this.prescription = res.data
      this.spinner.hide();
    }).catch(error => console.log(error));
    console.log(this.prescription)
  }
  formatdate(date) {
    moment.locale('fr');
    return moment(date).format('DD MMMM YYYY');
  }
  printDiv() {
    // Masquer la classe nav-sticky.navbar-custom lors de l'impression
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '@media print { .nav-sticky.navbar-custom { display: none; } }';
    document.head.appendChild(style);

    // Appeler la fonction d'impression de la fenêtre
    window.print();

    // Retirer le style CSS ajouté après l'impression
    document.head.removeChild(style);

  }

  onButtonTouchStart() {
    this.isTouched = true; // Définit la variable isTouched à true lorsque l'utilisateur touche le bouton
  }

  // onButtonTouchEnd() {
  //   if (this.isTouched) { // Vérifie si l'utilisateur a touché le bouton (par opposition à un clic avec une souris)
  //     this.printDiv('prescription');
  //     this.isButtonVisible = false; // Masque le bouton si l'utilisateur a touché le bouton
  //   }
  //   this.isTouched = false; // Réinitialise la variable isTouched à false après chaque événement tactile
  // }
}
