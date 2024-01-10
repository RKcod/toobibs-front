import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../api/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';

declare const window: any;
declare const document: any;
declare const CinetPay: any;

@Component({
    selector: 'app-book-appointment',
    templateUrl: './book-appointment.component.html',
    styleUrls: ['./book-appointment.component.scss']
})
export class BookAppointmentComponent implements OnInit {

    totalPrice: number = 0;
    showElements = false;
    lat: number;
    lng: number;
    zoom: number;

    time_url: any = null;

    cinetpay_called = false;

    fromDate: NgbDate;
    toDate: NgbDate | null = null;

    hoveredDate: NgbDate | null = null;

    firstDay: Date|null = null;
    lastDay: Date|null = null;

    id: any = null;
    doctor: any = null;

    user: any = ApiService.getUser();
    draggable = true;
    date_rdv: any;

    data: any = {
        users_id: 0,
        date: null,
        time: null,
        motif: '',
        type: '',
        doctorName: '',
        doctorSpeciality: '',
        address: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        is_me: 1,
        teleconsult: 0,
        status: 0,
        doctor_id: 0,
        payment_method: 'Paiement en liquide',
    };


    times: any[] = [];

    return_url: any = null;
    caller = 'PATIENT';

    public payPalConfig?: IPayPalConfig;
    showButton = false;

    hours: any[] = [];

    tel: any = null;

    redirect_path = window.location.pathname + '' + window.location.search;
    tranched = .5;

    constructor(calendar: NgbCalendar, public api: ApiService, public activedRoute: ActivatedRoute, public router: Router, private spinner: NgxSpinnerService, private modalService: NgbModal) {
        this.fromDate = calendar.getToday();
        this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);


        var curr = new Date;
        this.firstDay = new Date();//curr.setDate((curr.getDate() - curr.getDay())));
        this.lastDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 8));
        this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
        this.activedRoute.params.subscribe((params: any) => {
            this.id = params.id;
            //console.log(this.id);
            this.getDoctor();
            if (params.returnUrl != null) {
                this.return_url = params.returnUrl;
            }
            if (params.returnUrl != null) {
                this.caller = params.caller;
            }

            this.loadInitialUserData();
        });
        this.activedRoute.queryParams.subscribe((params: any) => {
            if (params.returnUrl != null) {
                this.return_url = params.returnUrl;
            }
            if (params.caller != null) {
                this.caller = params.caller;
                if (this.caller == 'DOCTOR') {
                    this.generateTranche();
                }
            }
            if (params.date != null) {
                let d = params.date;
                let arr = d.toString().split('-');
                this.data.date = {
                  day: parseInt(arr[2]),
                  month: parseInt(arr[1]),
                  year: parseInt(arr[0])
                };
                this.getHours(params.date);
            }
            if (params.time != null) {
                this.time_url = params.time;
            }
            this.loadInitialUserData();
        });
    }

    ngOnInit(): void {

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
    }

    toggleElements() {
        this.showElements = !this.showElements;
    }

    getDoctor() {
        this.spinner.show();
        this.api.performGETCall('users/' + this.id, { include: 'availabilities,prices' }, true).subscribe(res => {
            //console.log(res);
            this.spinner.hide();
            this.doctor = res.data;

            /*if (localStorage.getItem("rates") == null) {
              this.api.performRemoteGETCall("https://free.currconv.com/api/v7/convert?q=" + this.doctor?.prices.data.currency + "_EUR&compact=ultra&apiKey=52e94dc535b5837c4574").subscribe(res => {
                localStorage.setItem("rates", JSON.stringify(res));
              });
            } else {
              let res = JSON.parse(localStorage.getItem("rates"));
              this.totalPrice = (parseFloat(this.doctor?.prices.data.price_teleconsultation) * res[this.doctor?.prices.data.currency + "_EUR"]);
              //console.log(this.totalPrice);
            }*/
            /*this.api.performRemoteGETCallNonJson("https://www.xe.com/fr/currencyconverter/convert/?Amount="+parseFloat(this.doctor?.prices.data.price_teleconsultation)+"&From="+this.doctor?.prices.data.currency+"&To=EUR").subscribe(result => {
              //console.log(result);
            });*/
        }, err => {
            this.spinner.hide();
            //console.log(err.error);
            this.api.handleErrors(err.error.message);

        });
    }

    getHours(date) {
        this.spinner.show();
        this.api.performGETCall('availabilities/status/date', { date: date, status: 0 }, true).subscribe(res => {
            //console.log(res);
            this.spinner.hide();
            this.hours = res.data;
            if (this.time_url != null) {
                this.data.time = this.time_url;
            }

            //console.log(this.time_url);
            this.api.displayMessage('Succès', 'Les horaires ont bien étés chargés. Vous pouvez sélectionner une heure.');
        }, err => {
            this.spinner.hide();
            //console.log(err.error);
            this.api.handleErrors(err.error.message);

        });
    }

    private setCurrentLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                //console.log(position);
                this.lat = position.coords.latitude;
                this.lng = position.coords.longitude;
                this.zoom = 15;
            });
        }
    }

    onDateSelection(date: NgbDate) {
        /*if (!this.fromDate && !this.toDate) {
          this.fromDate = date;
        } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
          this.toDate = date;
        } else {
          this.toDate = null;
          this.fromDate = date;
        }*/

        let res = false;
        //if(this.caller == 'PATIENT'){
        let d = ApiService.converStringToDate(date.year + '-' + date.month + '-' + date.day);
        let first_d = ApiService.converStringToDate(this.firstDay?.getFullYear()
        + '-' + ((this.firstDay ? this.firstDay.getMonth(): 0) + 1)
        + '-' + this.firstDay?.getDate());

        //console.log("d", d);
        //console.log("dd", first_d);
        let is_in_range = d >= first_d;// && d <= this.lastDay;
        //return d >= this.firstDay && d <= this.lastDay;

        //console.log("is in range : ", is_in_range);

        if (is_in_range) {
            if (this.caller == 'PATIENT') {
                for (let d of this.doctor?.availabilities.data) {
                    let splitted = d.date.split('-');
                    let ngD = new NgbDate(splitted[0], splitted[1], splitted[2]);
                    if (splitted[0] == date.year && splitted[1] == date.month && splitted[2] == date.day) {
                        res = true;
                        this.getHours(date.year + '-' + date.month + '-' + date.day);
                        break;
                    }
                }
                if (!res) {
                    this.api.handleErrors('Ce médécin n\'est pas disponible pour le jour sélectionné!');
                }
            }
            res = true;
        } else {
            this.api.handleErrors('Vous ne pouvez pas prendre rendez-vous pour des jours passés!');
        }
        if (!res) {
            this.data.date = null;
        }
        //console.log('res : ', res);
        //}

        return res;
    }

    isInside(date: NgbDate, dates) {
        let res = false;
        if (this.caller == 'PATIENT') {
            for (let d of this.doctor?.availabilities.data) {
                let splitted = d.date.split('-');
                let ngD = new NgbDate(splitted[0], splitted[1], splitted[2]);
                if (splitted[0] == date.year && splitted[1] == date.month && splitted[2] == date.day) {
                    res = true;
                    break;
                }
            }
        }
        return res;
    }

    /*
      isRange(date: NgbDate) {
        return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
      }

      isHovered(date: NgbDate) {
        return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
      }*/
    saveRdv() {
        //console.log(this.data);
        if (this.data.date != null && this.data.time != null && this.data.first_name.length > 0 && this.data.last_name.length > 0 && this.data.type.length > 0 && this.data.motif.length > 0) {

            var countryData = this.tel.getSelectedCountryData();
            if (countryData.dialCode != 225 && !this.tel.isValidNumber()) {
                this.api.handleErrors('Numéro de téléphone invalide!');
                return;
            } else {
                this.data.phone = countryData.dialCode == 225 ? (this.tel.getNumber().toString().indexOf('225') != -1 ? this.tel.getNumber().toString().replace('+', '') : '225' + this.tel.getNumber().toString().replace('+', '')) : this.tel.getNumber().toString().replace('+', '');
            }
            if (this.data.type == 'Consultation à domicile' && this.data.address.length == 0) {
                this.api.handleErrors('Veuillez renseigner votre adresse pour la consultation à domicile!');
                return;
            }
            const d: any = {
                date: this.data.date.year + '-' + this.api.addZeroToNumber(this.data.date.month) + '-' + this.api.addZeroToNumber(this.data.date.day),
                time: this.data.time,//.hour + ":" + this.data.time.minute,
                users_id: ApiService.getUser().real_id,
                motif: this.data.motif,
                type: this.data.type,
                doctorName: this.data.doctorName,
                doctorSpeciality: this.data.doctorSpeciality,
                first_name: this.data.first_name,
                last_name: this.data.last_name,
                email: this.data.email,
                phone: this.data.phone,
                address: this.data.address,
                is_me: this.data.is_me,
                teleconsult: this.data.teleconsult,
                status: 0,
                cost: this.data.type == 'Consultation au cabinet' ? this.doctor?.prices.data.price_cabinet_consultation : this.data.type == 'Consultation à domicile' ? this.doctor?.prices.data.price_house_consultation : this.doctor?.prices.data.price_teleconsultation,
                currency: this.doctor?.prices.data.currency,
                doctor_id: this.doctor.real_id,
                payment_method: this.data.payment_method,
            };
            if (this.caller == 'DOCTOR') {
                d.is_doctor = true;
            }

            this.spinner.show();
            console.log('data save ', d);
            this.api.performPOSTCall('appointments', d, false, true).subscribe(u => {
                this.spinner.hide();
                console.log(u);
                //if (this.data.type != "Téléconsultation") {
                this.api.displayMessage('Succès', 'RDV enregistré, vous recevrez un sms une fois votre RDV confirmé par le médecin');
                this.router.navigate(['/appointment-sent']);
                //} else {
                //  this.router.navigate(["/payment/"+u.data.id]);
                //  this.initPayment();
                // }


            }, err => {
                this.spinner.hide();
                //console.log(err.error);
                this.api.handleErrors(err.error.message);
            });
        } else {
            this.api.handleErrors('Veuillez remplir tous les champs!!');
        }
    }

    loadInitialUserData(clear = false) {
        if (this.user == null || this.caller == 'DOCTOR') {
            clear = true;
        }
        this.data.first_name = clear ? '' : this.user.first_name;
        this.data.last_name = clear ? '' : this.user.last_name;
        this.data.email = clear ? '' : this.user.email;
        this.data.phone = clear ? '' : this.user.phone;
        this.data.address = clear ? '' : this.user.address;
    }


    initPayment() {
        let _this = this;
        if (this.doctor?.prices.data.currency == 'XOF') {
            this.totalPrice = (parseFloat(this.data.type == 'Consultation au cabinet' ? this.doctor?.prices.data.price_cabinet_consultation : this.data.type == 'Consultation à domicile' ? this.doctor?.prices.data.price_house_consultation : this.doctor?.prices.data.price_teleconsultation) / 655.95);
        } else {
            this.totalPrice = (parseFloat(this.data.type == 'Consultation au cabinet' ? this.doctor?.prices.data.price_cabinet_consultation : this.data.type == 'Consultation à domicile' ? this.doctor?.prices.data.price_house_consultation : this.doctor?.prices.data.price_teleconsultation));
        }
        //console.log(this.totalPrice);
        this.payPalConfig = {
            currency: 'EUR',
            clientId: 'AQCZljwG7_uT3NYYYGzE3P3WwM3tFAavsBIV0Q4wUphNBsS_spQ0wVWkW9AKOl3kIZSJRHCMpbPMxAFH',//'AWc1EMByRLJAV0uLRkSAVz-uYFsi7Jc40lRXr7ETayw0-JJi4kBmkWs-JIwdj-u3iD2bJBrhGU7_psXU',
            createOrderOnClient: (data) => <ICreateOrderRequest>{
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'EUR',
                        value: this.totalPrice.toFixed(2).toString(),
                        breakdown: {
                            item_total: {
                                currency_code: 'EUR',
                                value: this.totalPrice.toFixed(2).toString()
                            }
                        }
                    },
                    items: [{
                        name: 'Frais de consultation',
                        quantity: '1',
                        category: 'DIGITAL_GOODS',
                        unit_amount: {
                            currency_code: 'EUR',
                            value: this.totalPrice.toFixed(2).toString(),
                        },
                    }]
                }]
            },
            advanced: {
                commit: 'true'
            },
            style: {
                label: 'paypal',
                layout: 'vertical'
            },
            onApprove: (data, actions) => {
                actions.order.capture();
                actions.order.get().then(details => {
                    _this.savePayment(details);
                    ////console.log('onApprove - you can get full order details inside onApprove: ', details);
                });

                ////console.log('onApprove - transaction was approved, but not authorized', data, actions);


            }
        };
        //console.log(this.payPalConfig);
    }

    savePayment(details: any) {
      console.log('payment details : ', details);
      if (details.status == 'APPROVED') {
        this.data.payment_method = 'Paypal';
        this.saveRdv();
      } else {
        this.api.handleErrors('Une erreur s\'est produite lors du paiement');
      }
    }

    typeChanged() {
      this.showButton = this.data.type != 'Téléconsultation';
    }

    validateForm() {
      if (this.data.type == 'Consultation à domicile' && this.data.address.trim().length == 0) {
        console.log('address not ok');
        this.showButton = false;
        return;
      }
      this.showButton = this.caller == 'PATIENT' && (this.data.date != null && this.data.time != null && this.data.first_name.length > 0 && this.data.last_name.length > 0 && this.data.phone.length > 0 && this.data.motif.length > 0);
      if (this.showButton) {
        this.initPayment();
      }
    }

    async doMobilePay() {
        const $this = this;
        let res = '';

        if (this.data.type == 'Consultation à domicile' && this.data.address.length == 0) {
            this.api.handleErrors('Veuillez renseigner votre adresse pour la consultation à domicile!');
            return;
        }
        if (this.doctor?.prices.data.currency != 'XOF') {
            this.totalPrice = (parseFloat(this.data.type == 'Consultation au cabinet' ? this.doctor?.prices.data.price_cabinet_consultation : this.data.type == 'Consultation à domicile' ? this.doctor?.prices.data.price_house_consultation : this.doctor?.prices.data.price_teleconsultation) * 655.95);
        } else {
            this.totalPrice = (parseFloat(this.data.type == 'Consultation au cabinet' ? this.doctor?.prices.data.price_cabinet_consultation : this.data.type == 'Consultation à domicile' ? this.doctor?.prices.data.price_house_consultation : this.doctor?.prices.data.price_teleconsultation));
        }
        //console.log(this.totalPrice);

        let params: any = {
            cpm_amount: this.totalPrice,
            cpm_currency: 'XOF',
            cpm_site_id: '110920',
            cpm_trans_id: this.api.getUniqueId(3),
            cpm_trans_date: new Date().toLocaleString(),
            cpm_payment_config: 'SINGLE',
            cpm_page_action: 'PAYMENT',
            cpm_version: 'V1',
            cpm_language: 'fr',
            cpm_designation: 'Frais de consultation',
            cpm_custom: 0,
            apikey: '2953648565f8eed94e04143.48642240',
        };


        try {
            //this.spinner.show();
            CinetPay.setConfig({
                apikey: '2953648565f8eed94e04143.48642240',
                site_id: 110920,
                notify_url: 'https://api.toobibs.com/notify/'
            });
            //error
            CinetPay.on('error', function (e) {
                $this.api.handleErrors('');
            });
            //ajax
            CinetPay.on('ajaxStart', function () {
                //document.getElementById('bt_get_signature').setAttribute('disabled', 'disabled');
            });
            CinetPay.on('ajaxStop', function () {
                //document.getElementById('bt_get_signature').removeAttribute('disabled');
            });
            //Lorsque la signature est généré
            CinetPay.on('signatureCreated', function (token) {
                //console.log('Tocken généré: ' + token);
            });
            CinetPay.on('paymentPending', function (e) {
                //$this.api.displayMessage("Paiement", "Paiement en cours");

                //error_div.innerHTML += '<b>code:</b>' + e.code + '<br><b>Message:</b>:' + e.message;
            });
            CinetPay.on('paymentSuccessfull', function (paymentInfo) {
                //console.log("Payment data : ", paymentInfo);
                //cpm_trans_status: "ACCEPTED"
                if (paymentInfo.cpm_trans_status == 'ACCEPTED') {
                    document.getElementById('cinetpayCloseModal').click();
                    if (!$this.cinetpay_called) {
                        $this.api.displayMessage('Succès', 'Votre paiement a été validé avec succès');
                        $this.data.payment_method = 'Mobile money';
                        $this.saveRdv();
                        $this.cinetpay_called = true;
                    }

                    //error_div.innerHTML = '';
                    //sucess_div.innerHTML = 'Votre paiement a été validé avec succès : <br> Montant :' + paymentInfo.cpm_amount + '<br>';
                    //params.trans_id = Math.floor((Math.random() * 10000000) + 10000);
                } else {
                    //paymentInfo.cpm_error_message
                    $this.api.handleErrors('');
                }
            });

            CinetPay.setSignatureData({
                amount: this.totalPrice,
                trans_id: this.api.getUniqueId(3),
                currency: 'XOF',
                designation: 'Frais de consultation',
                custom: ''
            });
            CinetPay.getSignature();

            /*const call_signature: any = await this.api.performPostPromiseText("https://api.cinetpay.com/v1/?method=getSignatureByPost", params);
            let signature = "";
            signature = call_signature;
            params.signature = signature;
            params.return_url = "https://toobibs.com/close";
            const do_pay = await this.api.performPostPromise("https://secure.cinetpay.com", params);
            //console.log(do_pay);
            const $this = this;
            setTimeout(() => {
              $this.checkTransaction(params.cpm_trans_id);
            }, 5000);*/
        } catch (e) {
            this.spinner.hide();
            //console.log(e);
            this.api.handleErrors('Une erreur s\'est produite');
        }


        /*let modalRef = this.modalService.open(PaymentComponent, {ariaLabelledBy: 'modal-basic-title', windowClass: 'availability'});
        modalRef.componentInstance.amount = parseFloat(this.doctor?.prices.data.price_teleconsultation);
        modalRef.result.then((result) => {
          //console.log(result);
          res = result;
          //this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
          //console.log("res : ",res);
          //console.log("reason : ",reason);
          //$this.getData();
          if(reason == "success"){
            this.data.payment_method = "Mobile money";
            $this.saveRdv();
          }
        });*/
    }

    async checkTransaction(key) {
        try {
            const $this = this;
            $this.spinner.show();
            const trans = await this.api.performPostPromise('https://api.cinetpay.com/v1/?method=checkPayStatus', {
                apikey: key,
                cpm_site_id: '110920',
                cpm_trans_id: '2953648565f8eed94e04143.48642240',
            });
            if (trans.transaction.cpm_trans_status.toString().toUpperCase() == 'ACCEPTED') {
                this.spinner.hide();
                this.data.payment_method = 'Cinetpay';
                this.saveRdv();
            } else {
                setTimeout(() => {
                    $this.checkTransaction(key);
                }, 5000);
            }
        } catch (e: any) {
            this.spinner.hide();
            this.api.handleErrors(e.message);
        }
    }

    generateTranche() {
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
        let start_time = {
            hour: 8,
            minute: 0,
        };
        let end_time = {
            hour: 18,
            minute: 0,
        };
        let start_ = start_time;
        let end_ = end_time;

        let times: any[] = [];
        let go = true;

        let start_date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), start_.hour, start_.minute, 0);
        let end_date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), end_.hour, end_.minute, 0);

        times.push(this.api.addZeroToNumber(start_date.getHours()) + ':' + this.api.addZeroToNumber(start_date.getMinutes()));

        let i = 0;
        //console.log(i + " : " + start_date.getHours() + " < " + end_date.getHours());
        while (start_date.getHours() < end_date.getHours()) {
            //console.log("i = ", i);
            switch (parseFloat(this.tranched.toString())) {
                case 1:
                    start_date = this.api.dateAdd(start_date, 'hour', 1) || new Date();
                    times.push(this.api.addZeroToNumber(start_date.getHours()) + ':' + this.api.addZeroToNumber(start_date.getMinutes()));
                    break;
                case 2:
                    start_date = this.api.dateAdd(start_date, 'hour', 2) || new Date();
                    times.push(this.api.addZeroToNumber(start_date.getHours()) + ':' + this.api.addZeroToNumber(start_date.getMinutes()));
                    /*times.push({
                      hour: start_date.getHours(),
                      minute: start_date.getMinutes(),
                    });*/
                    break;
                case .5:
                    start_date = this.api.dateAdd(start_date, 'minute', 30) || new Date();
                    times.push(this.api.addZeroToNumber(start_date.getHours()) + ':' + this.api.addZeroToNumber(start_date.getMinutes()));
                    /*times.push({
                      hour: start_date.getHours(),
                      minute: start_date.getMinutes(),
                    });*/
                    break;
                case .25:
                    start_date = this.api.dateAdd(start_date, 'minute', 15) || new Date();
                    times.push(this.api.addZeroToNumber(start_date.getHours()) + ':' + this.api.addZeroToNumber(start_date.getMinutes()));
                    /*times.push({
                      hour: start_date.getHours(),
                      minute: start_date.getMinutes(),
                    });*/
                    break;
            }
            i++;
        }

        this.times = times;
        //console.log(times);

    }
}
