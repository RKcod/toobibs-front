import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-doctor-registered',
  templateUrl: './doctor-registered.component.html',
  styleUrls: ['./doctor-registered.component.scss']
})
export class DoctorRegisteredComponent implements OnInit {

  constructor(public router: Router) {
    if (localStorage.getItem("token") != null && this.router.url == "/register") {
      this.router.navigate(["/home"]);
    }
  }

  ngOnInit(): void {
  }

}
