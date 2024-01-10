import { Component, OnInit ,ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/api/api.service';
export interface PeriodicAppointment {
  first_name: string;
  motif: string;
  status: number;
  cost:string;
  created_at: string;
  actions:string;
}

export interface PeriodicPrescription {
  gender: string;
  profile: string;
  reason: string;
  name:string;
  created_at: string;
  actions:string;
}




@Component({
  selector: 'app-patient-menu',
  templateUrl: './patient-menu.component.html',
  styleUrls: ['./patient-menu.component.scss']
})
export class PatientMenuComponent implements OnInit {

  @ViewChild('modalContent') modalContent: any;
  @ViewChild('modalContent1') modalContent1: any;

  // dataSourcePrescription = new MatTableDataSource<PeriodicPrescription>(ELEMENT_DATA2);
  stateTabs=true;
  dateDebut: string = '';
  dateFin: string = '';
  statut: string;
  reason : string;
  name:string;
  dataSourceAppointment : PeriodicAppointment [] =[];
  dataSourcePrescription : PeriodicPrescription []=[];
  detailsAppoint: any;
  detailsPrescriptions:any

  constructor(private route: ActivatedRoute,private router:Router, 
    private modalService:NgbModal,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,){}


  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const phone = params['id'];
      this.getPatientDoctor(phone);
      this.getPrescription(phone);
    });
  }

  openModal(object: any) :void {
    this.detailsAppoint = object;
    this.modalService.open(this.modalContent);
  }

  openModal1(object:any):void {
    this.detailsPrescriptions=object
    this.modalService.open(this.modalContent1);
  }


  async getPatientDoctor(phone) {
    this.spinner.show();
    try {
      const response: any = await this.apiService.performGetRequest(
        `appoints-patients?doctorId=${ApiService.getUser().real_id}&phone=${phone}`
      );
  
      this.dataSourceAppointment = response;
  
      this.spinner.hide();
    } catch (error) {
      console.log(error);
    }
  }

  async rechercherPatients() {
    this.spinner.show();
    try {
      const phone = this.route.snapshot.params['id']; 
      let queryParams = `appoints-patients?doctorId=${ApiService.getUser().real_id}&phone=${phone}`;
  
      if (this.dateDebut) {
        queryParams += `&start=${this.dateDebut}`;
      }

      if (this.dateFin) {
        queryParams += `&end=${this.dateFin}`;
      }
  
      if (this.statut) {
        queryParams += `&status=${this.statut}`;
      }
  
      const response: any = await this.apiService.performGetRequest(queryParams);
  
      this.dataSourceAppointment = response;
  
      this.spinner.hide();
    } catch (error) {
      console.log(error);
    }
  }

  refreshTable (){
    this.dateDebut ="";
    this.dateFin="";
    this.statut="";
  }

  refreshPrescription(){
    this.reason ="";
    this.name="";
  }
  


  async getPrescription(phone) {
    this.spinner.show();
    try {
      const response: any = await this.apiService.performGetRequest(
        `prescriptions-patient?doctorId=${ApiService.getUser().real_id}&phone=${phone}`
      );
  
      this.dataSourcePrescription = response;
      this.spinner.hide();
    } catch (error) {
      console.log(error);
    }
  }

  async rechercherPrescriptions() {
    this.spinner.show();
    try {
      const phone = this.route.snapshot.params['id']; 
      let queryParams = `prescriptions-patient?doctorId=${ApiService.getUser().real_id}&phone=${phone}`;
  
      if (this.name) {
        queryParams += `&name=${this.name}`;
      }

      if (this.reason) {
        queryParams += `&reason=${this.reason}`;
      }
  
      const response: any = await this.apiService.performGetRequest(queryParams);
  
      this.dataSourcePrescription = response;
  
      this.spinner.hide();
    } catch (error) {
      console.log(error);
    }
  }


  changeStateTabs(value){
    if(value==1){
      this.stateTabs=true
    }else{
      this.stateTabs=false
    }
  }

}
