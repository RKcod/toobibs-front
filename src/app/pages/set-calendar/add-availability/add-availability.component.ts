import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ApiService } from "../../../api/api.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-add-availability',
  templateUrl: './add-availability.component.html',
  styleUrls: ['./add-availability.component.scss']
})
export class AddAvailabilityComponent implements OnInit {

  data = {
    date: {
      year: new Date().getFullYear(),
      month: new Date().getMonth()+1,
      day: new Date().getDate(),
    },
    start_time: {
      hour: 8,
      minute: 0,
    },
    end_time: {
      hour: 18,
      minute: 0,
    },
    description: "",
    users_id: 0
  };

  times: any[] = [];

  tranche = [
    //{value: .25, text: "15 minute"},
    {value: .5, text: "30 minute"},
    {value: 1, text: "1 heure"},
    {value: 2, text: "2 heure"},
  ];

  tranched = .5;

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public router: Router,
    private spinner: NgxSpinnerService) {
  }

  ngOnInit(): void {
  }


  generateTranche(){
    /*
    start_time: {
      hour: 8,
      minute: 0,
    },
    end_time: {
      hour: 18,
      minute: 0,
    },
     */
    let start_ = this.data.start_time;
    let end_ = this.data.end_time;

    let times: any[] = [];
    let go = true;

    let start_date: Date = new Date(this.data.date.year, this.data.date.month, this.data.date.day, start_.hour, start_.minute, 0)
    let end_date: Date = new Date(this.data.date.year, this.data.date.month, this.data.date.day, end_.hour, end_.minute, 0)

    times.push({
      hour: start_date.getHours(),
      minute: start_date.getMinutes(),
    });

    let i = 0;
    //console.log(i+" : "+start_date.getHours() + " < "+ end_date.getHours());

    while(start_date.getHours() < end_date.getHours()){
      //console.log("i = ", i);
      switch (parseFloat(this.tranched.toString())) {
        case 1:
          start_date = this.api.dateAdd(start_date, "hour", 1) || new Date();
          times.push({
            hour: start_date?.getHours(),
            minute: start_date?.getMinutes(),
          });
          break;
        case 2:
          start_date = this.api.dateAdd(start_date, "hour", 2) || new Date();
          times.push({
            hour: start_date?.getHours(),
            minute: start_date?.getMinutes(),
          });
          break;
        case .5:
          start_date = this.api.dateAdd(start_date, "minute", 30) || new Date();
          times.push({
            hour: start_date?.getHours(),
            minute: start_date?.getMinutes(),
          });
          break;
        case .25:
          start_date = this.api.dateAdd(start_date, "minute", 15)  || new Date();
          times.push({
            hour: start_date?.getHours(),
            minute: start_date?.getMinutes(),
          });
          break;
      }
      i++;
    }

    this.times = times;
  //console.log(times);

  }

  removeTime(index){
    this.times.splice(index, 1);
  }

  save() {
    //console.log(this.data);
    if (this.data.date != null && this.times.length > 0) {
      const d = {
        date: this.data.date.year + "-" + this.api.addZeroToNumber(this.data.date.month) + "-" + this.api.addZeroToNumber(this.data.date.day),
        start_time: this.data.start_time.hour + ":" + this.data.start_time.minute,
        end_time: this.data.end_time.hour + ":" + this.data.end_time.minute,
        description: "",
        times: this.times,
        users_id: ApiService.getUser().real_id
      };

      this.spinner.show();

      this.api.performPOSTCall("availabilities", d, false, true).subscribe(u => {
        this.spinner.hide();
        //console.log(u);
        this.times = [];
        this.api.displayMessage("Succès", "Disponibilité pour ce jour enregistrée. Vous pouvez continuer l'ajout de vos disponibilités pour les jours suivants");


      }, err => {
        this.spinner.hide();
        //console.log(err.error);
        this.api.handleErrors(err.error.message);
      });
    } else {
      this.api.handleErrors("Veuillez remplir tous les champs!!");
    }
  }
}
