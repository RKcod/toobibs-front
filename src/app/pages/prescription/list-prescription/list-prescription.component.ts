import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import * as  moment from 'moment';
@Component({
  selector: 'app-list-prescription',
  templateUrl: './list-prescription.component.html',
  styleUrls: ['./list-prescription.component.scss']
})
export class ListPrescriptionComponent implements OnInit {
  prescriptions: any;

  constructor(private router: Router){
    const state = this.router.getCurrentNavigation()?.extras.state;
    this.prescriptions = state ? Object.values(state) : [];
  }

  ngOnInit(): void {
    console.log("pres", this.prescriptions);
  }

  formatdate(date) {
    moment.locale('fr');
    return moment(date).format("DD MMMM YYYY, à h:mm:ss")
  }
}
