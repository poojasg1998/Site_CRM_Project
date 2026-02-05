import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import {Location} from '@angular/common';
import { MandateService } from 'src/app/mandate-service.service';
import { SharedService } from 'src/app/shared.service';
import Swal from 'sweetalert2';
declare var window

@Component({
  selector: 'app-mandate-pricing-list',
  templateUrl: './mandate-pricing-list.component.html',
  styleUrls: ['./mandate-pricing-list.component.scss'],
})
export class MandatePricingListComponent  implements OnInit {
  filteredParams={
    status:'',
    team:'',
    executid:localStorage.getItem('Role')==='1'?'':localStorage.getItem('UserId'),
    loginid: localStorage.getItem('UserId'),
    source:'',
    counter:'',
    enquiredprop:'',
    visitedprop:'',
    suggestedprop:'',
    visitedPropertyName:'',
    suggetsedPropertyName:'',
    htype:'',
    active:'1',
    propid:'',
    limit:0,
    limitrows:30
  }
  localStorage = localStorage
  propertyList;
  isAdmin = false;
  constructor(private cdf:ChangeDetectorRef, private sharedService:SharedService, private _location: Location,private menuCtrl: MenuController,private router:Router,private activeRoute:ActivatedRoute,private _mandateService:MandateService) { }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((response)=>{
      this.isAdmin = this.localStorage.getItem('Role') === '1';
      this.getQueryParams();
      this.getBuilderList();
      this.getAllProperties(); 
    })
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  reset_filter(){
    this.filteredParams={
      status:this.filteredParams.status,
      team:'',
      executid:localStorage.getItem('Role')==='1'?'':localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      source:'',
      counter:this.filteredParams.counter,
      enquiredprop:'',
      visitedprop:'',
      suggestedprop:'',
      visitedPropertyName:'',
      suggetsedPropertyName:'',
      propid:'',
      htype:this.filteredParams.htype,
      active:'1',
      limit:0,
      limitrows:30
    }  
  }

  onHtype(htype){ 
    const queryParams = { };
    for (const key in this.filteredParams) {
      if (this.filteredParams.hasOwnProperty(key) && this.filteredParams[key] !== '') {
        queryParams[key] = this.filteredParams[key];
      } else {
        queryParams[key] = null;
      }
    }
    if(htype=='mandate'){
      this.router.navigate(['mandate-pricing-list'],{
        queryParams,
        queryParamsHandling:'merge'
      })
    }else{        
      this.router.navigate(['retail-pricing-list'],{
        queryParams,
        queryParamsHandling:'merge'
      })
    }
  }

  getQueryParams(){
    const queryString = window.location.search;
    const queryParams = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });
  
    Object.keys(this.filteredParams).forEach(key => {
      if (queryParams.hasOwnProperty(key)) {
        this.filteredParams[key] = queryParams[key];
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
          this.filteredParams[key] = '';
      }
    });
  }

  onBackbutton(){
    this._location.back();
  }

  getAllProperties(){
    this._mandateService.getPriceList().subscribe((resp) => {
      if (resp['status'] == 'True') {
        this.propertyList = resp['result'];
        this.propertyList1 =  resp['result'];
        // setTimeout(() => {
        //   if (this.selectedEditProp) {
        //     let selectedprop = this.propertyList.filter((data) => {
        //       return this.selectedEditProp.detailsId == data.detailsId;
        //     });
        //     this.editProp(selectedprop[0])
        //   }
        // }, 1000)
      } else {
        this.propertyList = [];
      }
    })
  }

  selectedOptions: any = {
    all:false,
    propInfo: false,
    brochure: false,
    priceSheet: false,
    video:false,
    floorPlan:false,
  };

  isEditProp
  priceSheetFileData: { [key: string]: {file:any,fileType:string, fileName: string, result: any } } = {}; 
  brochureFileData: { [key: string]: {file:any,fileName: string, result: any } } = {}; 
  videoFileData: { [fileType: string]: {file:any, fileName: string, result: string ,bhkId:any,v_idpk}[] } = {}
  floorPlanFileData: { [fileType: string]: {file:any, fileName: string, result: string,sqft:any ,bhkId:any,fp_idpk}[] } = {}
  projectInfo='';
  @ViewChild('addPropModal') addPropModal;
  @ViewChild('filePreviewModal') filePreviewModal;
  selectedVideoBHK
  selectedFloorPlanBHK
  showSpinner
  builderList
  builderPropertyList=[];
  builderName;
  builderPropertyName;
  builderPropertyid='';
  editingProp
  selectedFloorPlanFile
  fileTypes = [
    ['Common'], 
    ['1 BHK', '2 BHK'], 
    ['3 BHK', '4 BHK']
  ]
  


  closeAddPropModal(){
    this.selectedOptions= {
      all:false,
      propInfo: false,
      brochure: false,
      priceSheet: false,
      video:false,
      floorPlan:false,
    };
    this.isEditProp = false;
    this.priceSheetFileData = {};
    this.brochureFileData = {};
    this.videoFileData = {};
    this.floorPlanFileData = {};
    this.projectInfo = '';
    this.addPropModal.dismiss();
    this.selectedVideoBHK = '';
    this.selectedFloorPlanBHK = '';
  }

  getBuilderList(){
    this.sharedService.builderlist1().subscribe((response)=>{
      // this.builderList  = response['Builders']
      this.builderList = Array.isArray( response['Builders']) ?  response['Builders'] : [];
      // this.builderList = this.allBuilders.slice(0, this.rows);
    })
  }

  onBuilderSelected(event){    
    const paramMap = {
      cityid:'',
      builderid:event.value.id,
    };
    this.getpropertiesbybuilder(paramMap);
  }

  getpropertiesbybuilder(param) {
    this.sharedService.getpropertiesbybuilder(param).subscribe((response)=>{
      this.builderPropertyList = response['Properties']
    })
  }

  onBuilderPropertySelected(event){
    this.builderPropertyid = event.value.id
  }

  onBrochureFileSelected(event){
    if (event.target.files[0] && event.target.files[0].size > (100 * 1024 * 1024)) { 
      Swal.fire({
        title: 'File Size Exceeded',
        text: 'File Size limit is 100MB',
        icon: "error",
        heightAuto:false,
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        setTimeout(() => {
          event.target.value = '';
        }, 100);
      });
    }else{
      const input = event.target as HTMLInputElement;
      const files = input.files;  
      const file = event.target.files[0];
      const newFileName = file.name.replace(/[+]/g, '');
      const updatedFile = new File([file], newFileName, { type: file.type });
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.brochureFileData[0] = {
          file:updatedFile,
          fileName: file.name,
          result: reader.result 
        };
      };
      reader.readAsDataURL(file);

      if(this.isEditProp){
        this.showSpinner = true;
        setTimeout(() => {
          this.updateBrochure()
        }, 1000);
      }      
    }
  }

  updateBrochure() {    
    const formData = new FormData();
    formData.append('detailsId', this.editingProp.detailsId);
    formData.append('projectid', this.editingProp.PropId);
    formData.append('brochure', this.brochureFileData?.[0]?.file || ''); 

  
    this._mandateService.updateBrochure(formData).subscribe((resp) => {
      this.showSpinner = false;
      Swal.fire({
        text: 'Brochure Updated Successfully',
        icon: 'success',
        heightAuto:false,
        timer: 1000,
        showConfirmButton: false
      })
      this.getAllProperties();
    })
  }

  removeBrochureFile(){
    this.brochureFileData = {}; 
    const fileInput = document.getElementById('brochureInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; 
    }
  }

  onPriceSheetFileSelected(event,key,type){
    const input = event.target;    
    if (event.target.files[0] && event.target.files[0].size > (50 * 1024 * 1024)) { 
        Swal.fire({
          title: 'File Size Exceeded',
          text: 'File Size limit is 50MB',
          icon: "error",
          heightAuto:false,
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          setTimeout(() => {
            input.value = '';
          }, 100);
        });
    }else{
      const input = event.target as HTMLInputElement;
      const files = input.files;      
      for (let i = 0; i < files.length; i++) {       
        const file = files[i];
        const newFileName = file.name.replace(/[+]/g, '');
        const updatedFile = new File([file], newFileName, { type: file.type });

        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.priceSheetFileData[key] = {
            file:updatedFile,
            fileType:type,
            fileName: file.name,
            result: reader.result 
          };
        };
        reader.readAsDataURL(file);
        input.value = '';
      }     
          
      if(this.isEditProp){
        this.showSpinner = true;
        const bhkKeyMap: { [bhkId: string]: string } = {
          '1-0':'1',
          '1-1':'2',
          '2-0':'3',
          '2-1':'4',
          '0-0':'0'
        };
        setTimeout(() => {
          this.updatePriceSheet(bhkKeyMap[key])
        }, 1000);
      }     
    }
  }

  updatePriceSheet(key){
    const formData = new FormData();
    formData.append('detailsId', this.editingProp.detailsId)
    formData.append('projectid', this.editingProp.PropId)
    formData.append('psbhkId', key)
    formData.append('ps0bhk', this.priceSheetFileData['0-0']?.file || '');
    formData.append('ps1bhk', this.priceSheetFileData['1-0']?.file || '');
    formData.append('ps2bhk', this.priceSheetFileData['1-1']?.file || '');
    formData.append('ps3bhk', this.priceSheetFileData['2-0']?.file || '');
    formData.append('ps4bhk', this.priceSheetFileData['2-1']?.file || '');
    this._mandateService.postPriceSheetOnUpdate(formData).subscribe((resp) => {
      this.showSpinner = false;
      this.getAllProperties();
    })
  }

  removePriceSheet(key: string) {
    if (this.priceSheetFileData[key]) {
      delete this.priceSheetFileData[key];
    }    
  }

  
  deletepriceSheet(key){
    this.showSpinner = true;
    const bhkKeyMap: { [bhkId: string]: string } = {
      '1-0':'1',
      '1-1':'2',
      '2-0':'3',
      '2-1':'4',
      '0-0':'0'
    };
    let param = {};
    this.editingProp.Pricesheets.forEach(element => {
      if(element.bhkId == bhkKeyMap[key]){
        param={
          psid:element.PS_IDPK,
          pricesheetname:element.propdetails_pricesheet,
          detailid:this.editingProp.detailsId
        }
      }        
    });

    this._mandateService.deletepriceSheet(param).subscribe((resp) => {        
      Swal.fire({
        text: `PriceSheet Deleted Successfully for ` + bhkKeyMap[key] + 'BHK',
        icon: 'success',
        heightAuto:false,
        timer: 1000,
        showConfirmButton: false
      }).then((result)=>{  
        if(result.isDismissed == true){
          this.getAllProperties();  
          this.cdf.detectChanges();
        }     
      })
    })  
  }

  onVideoFileUploadedType(bhkType: string) {
    this.selectedVideoBHK = bhkType;
  } 
  checkBHKBeforeFileUpload(event: MouseEvent,type) {    
    if (type === 'video' &&  !this.selectedVideoBHK || type == 'floorPlan' && !this.selectedFloorPlanBHK) {
      event.preventDefault();
      Swal.fire({
        text: "Please select BHK type before uploading",
        confirmButtonText: "OK",
        icon:'error',
        heightAuto:false,
        allowOutsideClick: false,
      }) 
    }
  }

  onVideoFileSelected(event){
    const input = event.target as HTMLInputElement;
    const files = input.files;

    for (let i = 0; i < files.length; i++) {  
      const file = files[i];
      if (event.target.files[i] && event.target.files[i].size > (100 * 1024 * 1024)) { 
        Swal.fire({
          title: 'File Size Exceeded',
          text: 'File Size limit is 100MB',
          icon: "error",
          heightAuto:false,
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          setTimeout(() => {
            event.target.value = '';
          }, 100);
        });
      }else{
        const file = event.target.files[i];
        const newFileName = file.name.replace(/[+]/g, '');
        const updatedFile = new File([file], newFileName, { type: file.type });
        const reader = new FileReader();
        if (!this.videoFileData[this.selectedVideoBHK]) {
          this.videoFileData[this.selectedVideoBHK] = [];
        }
        reader.onload = (event: any) => {
          this.videoFileData[this.selectedVideoBHK].push({
            file:updatedFile,
            fileName: file.name,
            result: event.target.result,
            bhkId:'',
            v_idpk:''
          });
        };
        reader.readAsDataURL(file);

        if(this.isEditProp){
          this.showSpinner = true;
          setTimeout(()=>{
            this.updateVideo()
          },1000)
        }        
      }
    }
  }
  updateVideo(){
    const formData = new FormData();
    formData.append('detailsId', this.editingProp.detailsId)
    formData.append('projectid', this.editingProp.PropId)

    if( this.videoFileData.Common && this.videoFileData.Common.length>0){
      formData.append('pvbhkId', '0');
      this.videoFileData.Common?.forEach((videoFile) => {
        formData.append('pv0bhk[]', videoFile.file );
      });    
    }else{
      formData.append('pv0bhk[]', '');
    }

    if( this.videoFileData['1BHK'] && this.videoFileData['1BHK'].length>0){
      formData.append('pvbhkId', '1');
      this.videoFileData['1BHK']?.forEach((videoFile) => {
        formData.append('pv1bhk[]', videoFile.file );
      });
    }else{
      formData.append('pv1bhk[]', '' );
    }

    if( this.videoFileData['2BHK'] && this.videoFileData['2BHK'].length>0){
      formData.append('pvbhkId', '2');
      this.videoFileData['2BHK']?.forEach((videoFile) => {
        formData.append('pv2bhk[]', videoFile.file );
      });
    }else{
      formData.append('pv2bhk[]','' );
    }

    if( this.videoFileData['3BHK'] && this.videoFileData['3BHK'].length>0){
      formData.append('pvbhkId', '3');
      this.videoFileData['3BHK']?.forEach((videoFile) => {
        formData.append('pv3bhk[]', videoFile.file);
      });
    }else{
      formData.append('pv3bhk[]', '');
    }

    if(this.videoFileData['4BHK'] && this.videoFileData['4BHK'].length>0){
      formData.append('pvbhkId', '4');
      this.videoFileData['4BHK']?.forEach((videoFile) => {
        formData.append('pv4bhk[]', videoFile.file);
      });    
    }else{
      formData.append('pv4bhk[]', '');
    }

    this._mandateService.updateVideo(formData).subscribe((resp) => {
      this.showSpinner = false;
      Swal.fire({
        text: 'Video Added Successfully',
        icon: 'success',
        heightAuto:false,
        timer: 1000,
        showConfirmButton: false
      })
      this.getAllProperties();
    })
  }

  viewVideo(video) {
    if(this.isEditProp &&  !video.result  ){
      window.PreviewAnyFile.preview('https://lead247.in/images/videos/'+video.fileName)
      .then((res) => console.log('success', res))
      .catch((err) => console.log('error', err));
    }else{
      window.PreviewAnyFile.previewBase64(
        success => console.log("success"),
        error => console.log("error"),
        video.result     
      )
    }    
  }

  removeVideoFile(i) {
    this.videoFileData[this.selectedVideoBHK].splice(i, 1); 
    this.videoFileData = { ...this.videoFileData };
  }

  deleteVideo(index){
    this.showSpinner = true;
    let param={}
    param={
      videoId:this.videoFileData[this.selectedVideoBHK][index].v_idpk,
      videofilename:this.videoFileData[this.selectedVideoBHK][index].fileName,
      detailid:this.editingProp.detailsId
    }

    this._mandateService.deleteVideo(param).subscribe((resp) => {
      this.videoFileData = {};  
      Swal.fire({
        text: 'Video Deleted Successfully',
        icon: 'success',
        heightAuto:false,
        timer: 1000,
        showConfirmButton: false
      }).then((result)=>{
        if(result.isDismissed == true){
          this.getAllProperties();  
          this.cdf.detectChanges();
        }
      })
    })
  }

  selectedFloorPlanBHKIds = []
  onFloorPlanUploadedType(bhkType: string) {
    this.selectedFloorPlanBHK = bhkType;  
    const bhkMap: { [key: string]: number } = {
      'Common': 0,
      '1BHK': 1,
      '2BHK': 2,
      '3BHK': 3,
      '4BHK': 4
    };
  
    const bhkId = bhkMap[bhkType];  
    if (!this.selectedFloorPlanBHKIds?.includes(bhkId)) {
      this.selectedFloorPlanBHKIds?.push(bhkId);
    }
  }

  onFloorPlanFileSelected(event){
    const input = event.target as HTMLInputElement;
    const files = input.files;

    for (let i = 0; i < files.length; i++) {  
      const file = files[i];
      if (event.target.files[i] && event.target.files[i].size > (10 * 1024 * 1024)) { 
        Swal.fire({
          title: 'File Size Exceeded',
          text: 'File Size limit is 10MB',
          icon: "error",
          heightAuto:false,
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          setTimeout(() => {
            event.target.value = '';
          }, 100);
        });
      }else{
        const file = event.target.files[i];
        const newFileName = file.name.replace(/[+]/g, '');
        const updatedFile = new File([file], newFileName, { type: file.type });
        const reader = new FileReader();
        if (!this.floorPlanFileData[this.selectedFloorPlanBHK]) {
          this.floorPlanFileData[this.selectedFloorPlanBHK] = [];
        };

        reader.onload  = (event: any) => {
          this.floorPlanFileData[this.selectedFloorPlanBHK].push({
            file:updatedFile,
            fileName: file.name,
            result: event.target.result,
            sqft:this.floorPlanFileData[this.selectedFloorPlanBHK]['sqft'],
            bhkId:'',
            fp_idpk:'',
          });
        };
        reader.readAsDataURL(file)
      }   
    }
  }

  onFloorePlanView(file: any) {
    this.selectedFloorPlanFile = file;
    if(this.isEditProp){
      window.PreviewAnyFile.preview('https://lead247.in/images/floorplans/'+file.fileName)
      .then((res) => console.log('success', res))
      .catch((err) => console.log('error', err));
    }else{
      if(this.selectedFloorPlanFile.fileName.endsWith('.pdf')){    
        window.PreviewAnyFile.previewBase64(
          success => console.log("success"),
          error => console.log("error"),
          file.result     
        )
      }else{
        this.filePreviewModal.present(); 
      } 
    }
  }

  removeFloorPlanFile(i) {
    this.floorPlanFileData[this.selectedFloorPlanBHK].splice(i, 1); 
    this.floorPlanFileData = { ...this.floorPlanFileData };
  }
  deleteFloorPlan(index){
    this.showSpinner = true;
    let param={}
    param={
      pfid:this.floorPlanFileData[this.selectedFloorPlanBHK][index].fp_idpk,
      floorplanName:this.floorPlanFileData[this.selectedFloorPlanBHK][index].fileName,
      detailid:this.editingProp.detailsId
    }

    this._mandateService.deletefloorplan(param).subscribe((resp) => {
      Swal.fire({
        text: `PriceSheet Deleted Successfully for ` + this.floorPlanFileData[this.selectedFloorPlanBHK][index].bhkId + 'BHK',
        heightAuto:false,
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
      }).then((result)=>{
        if(result.isDismissed == true){
          this.getAllProperties();  
          this.cdf.detectChanges();
        }
      })
    })
  }

  updateFloorPlan_PropInfo(){
    if(this.builderPropertyid == ''){
      Swal.fire({
        title: 'Select the Property',
        icon: 'error',
        heightAuto:false,
        timer: 2000,
        showConfirmButton: false
      })
    }else{
      const formData = new FormData();
      formData.append('detailsId', this.editingProp.detailsId);
      formData.append('projectid', this.builderPropertyid || '');
      formData.append('projectinfo', this.projectInfo || '');  
      formData.append('fpbhkId', this.selectedFloorPlanBHKIds.join(','));  
      if(this.floorPlanFileData.Common && this.floorPlanFileData.Common.length>0){
        this.floorPlanFileData.Common?.forEach((floorPlanFile) => {
          formData.append('fp0bhk[]', floorPlanFile.file || '');
        }); 
        const sqftValues = this.floorPlanFileData['Common'].map(fp => fp.sqft).join(',');
        formData.append('fp0bhksqft', sqftValues)    
      }else{
        formData.append('fp0bhk[]', '');
        formData.append('fp0bhksqft', '');
      }
    
      if( this.floorPlanFileData['1BHK'] && this.floorPlanFileData['1BHK'].length>0){
        this.floorPlanFileData['1BHK']?.forEach((floorPlanFile) => {          
          formData.append('fp1bhk[]', floorPlanFile.file );        
        });
        const sqftValues = this.floorPlanFileData['1BHK'].map(fp => fp.sqft).join(',');
        formData.append('fp1bhksqft', sqftValues)
      }else{
        formData.append('fp1bhk[]', '');
        formData.append('fp1bhksqft', '')
      }

      if( this.floorPlanFileData['2BHK'] && this.floorPlanFileData['2BHK'].length>0){
        this.floorPlanFileData['2BHK']?.forEach((floorPlanFile) => {
          formData.append('fp2bhk[]', floorPlanFile.file );
        });
        const sqftValues = this.floorPlanFileData['2BHK'].map(fp => fp.sqft).join(',');
        formData.append('fp2bhksqft', sqftValues)
      }else{
        formData.append('fp2bhk[]', '');
        formData.append('fp2bhksqft','');
      }
      
      if(this.floorPlanFileData['3BHK'] && this.floorPlanFileData['3BHK'].length>0){
        this.floorPlanFileData['3BHK']?.forEach((floorPlanFile) => {
          formData.append('fp3bhk[]',floorPlanFile.file);
        });
        const sqftValues = this.floorPlanFileData['3BHK'].map(fp => fp.sqft).join(',');
        formData.append('fp3bhksqft',sqftValues);
      }else{
        formData.append('fp3bhk[]','');
        formData.append('fp1bhksqft','');
      }
  
      if(this.floorPlanFileData['4BHK'] && this.floorPlanFileData['4BHK'].length>0){
        this.floorPlanFileData['4BHK']?.forEach((floorPlanFile) => {
          formData.append('fp4bhk[]',floorPlanFile.file);
        });
        const sqftValues = this.floorPlanFileData['4BHK'].map(fp => fp.sqft).join(',');
        formData.append('fp4bhksqft', sqftValues)
      }else{
        formData.append('fp4bhk[]', '');
        formData.append('fp4bhksqft','')
      }

      this._mandateService.updatePropertyInfo(formData).subscribe((resp) => {
        Swal.fire({
          text: 'Project Details Updated Successfully',
          icon: 'success',
          heightAuto:false,
          timer: 1000,
          showConfirmButton: false
        }).then(() => {
          location.reload();
        })
      })
    }
  }

  addProperty(){    
    const formData = new FormData();
    if(this.builderPropertyid == ''){
      Swal.fire({
        title: 'Select the Property',
        icon: 'error',
        heightAuto:false,
        timer: 2000,
        showConfirmButton: false
      })
    }else{
      this.showSpinner = true;
      formData.append('projectid', this.builderPropertyid || '');
      formData.append('projectinfo', this.projectInfo || '');    
      formData.append('brochure', this.brochureFileData?.[0]?.file || '');    
      formData.append('ps0bhk', this.priceSheetFileData['0-0']?.file || '');
      formData.append('ps1bhk', this.priceSheetFileData['1-0']?.file || '');
      formData.append('ps2bhk', this.priceSheetFileData['1-1']?.file || '');
      formData.append('ps3bhk', this.priceSheetFileData['2-0']?.file || '');
      formData.append('ps4bhk', this.priceSheetFileData['2-1']?.file || '');

      if( this.videoFileData.Common && this.videoFileData.Common.length>0){
        this.videoFileData.Common?.forEach((videoFile) => {
          formData.append('pv0bhk[]', videoFile.file );
        });    
      }else{
        formData.append('pv0bhk[]', '');
      }

      if( this.videoFileData['1BHK'] && this.videoFileData['1BHK'].length>0){
        this.videoFileData['1BHK']?.forEach((videoFile) => {
          formData.append('pv1bhk[]', videoFile.file );
        });
      }else{
        formData.append('pv1bhk[]', '' );
      }
  

      if( this.videoFileData['2BHK'] && this.videoFileData['2BHK'].length>0){
        this.videoFileData['2BHK']?.forEach((videoFile) => {
          formData.append('pv2bhk[]', videoFile.file );
        });
      }else{
        formData.append('pv2bhk[]','' );
      }
  
      if( this.videoFileData['3BHK'] && this.videoFileData['3BHK'].length>0){
        this.videoFileData['3BHK']?.forEach((videoFile) => {
          formData.append('pv3bhk[]', videoFile.file);
        });
      }else{
        formData.append('pv3bhk[]', '');
      }

      if(this.videoFileData['4BHK'] && this.videoFileData['4BHK'].length>0){
        this.videoFileData['4BHK']?.forEach((videoFile) => {
          formData.append('pv4bhk[]', videoFile.file);
        });    
      }else{
        formData.append('pv4bhk[]', '');
      }
  
      if(this.floorPlanFileData.Common && this.floorPlanFileData.Common.length>0){
        this.floorPlanFileData.Common?.forEach((floorPlanFile) => {
          formData.append('fp0bhk[]', floorPlanFile.file );
        }); 
        const sqftValues = this.floorPlanFileData['Common'].map(fp => fp.sqft).join(',');
        formData.append('fp0bhksqft', sqftValues)    
      }else{
        formData.append('fp0bhk[]', '');
        formData.append('fp0bhksqft', '');
      }
    
      // console.log(this.floorPlanFileData['1BHK'].length)
      if( this.floorPlanFileData['1BHK'] && this.floorPlanFileData['1BHK'].length>0){
        this.floorPlanFileData['1BHK']?.forEach((floorPlanFile) => {          
          formData.append('fp1bhk[]', floorPlanFile.file );        
        });
        const sqftValues = this.floorPlanFileData['1BHK'].map(fp => fp.sqft).join(',');
        formData.append('fp1bhksqft', sqftValues)
      }else{
        formData.append('fp1bhk[]', '');
        formData.append('fp1bhksqft', '')
      }
      // for (let pair of (formData as any).entries()) {
      //   console.log(`${pair[0]}:`, pair[1]);
      // }

      if( this.floorPlanFileData['2BHK'] && this.floorPlanFileData['2BHK'].length>0){
        this.floorPlanFileData['2BHK']?.forEach((floorPlanFile) => {
          formData.append('fp2bhk[]', floorPlanFile.file );
        });
        const sqftValues = this.floorPlanFileData['2BHK'].map(fp => fp.sqft).join(',');
        formData.append('fp2bhksqft', sqftValues);
      }else{
        formData.append('fp2bhk[]', '');
        formData.append('fp2bhksqft','');
      }
      
      if( this.floorPlanFileData['3BHK'] && this.floorPlanFileData['3BHK'].length>0){
        this.floorPlanFileData['3BHK']?.forEach((floorPlanFile) => {
          formData.append('fp3bhk[]', floorPlanFile.file);
        });
        const sqftValues = this.floorPlanFileData['3BHK'].map(fp => fp.sqft).join(',');
        formData.append('fp3bhksqft', sqftValues)
      }else{
        formData.append('fp3bhk[]', '');
        formData.append('fp1bhksqft', '')
      }
  
      if( this.floorPlanFileData['4BHK'] && this.floorPlanFileData['4BHK'].length>0){
        this.floorPlanFileData['4BHK']?.forEach((floorPlanFile) => {
          formData.append('fp4bhk[]', floorPlanFile.file );
        });
        const sqftValues = this.floorPlanFileData['4BHK'].map(fp => fp.sqft).join(',');
        formData.append('fp4bhksqft', sqftValues)
      }else{
        formData.append('fp4bhk[]', '');
        formData.append('fp4bhksqft','');
      }
  
      this._mandateService.createPricingList(formData).subscribe((resp) => {
        Swal.fire({
          title: 'Property Added Successfully',
          icon: 'success',
          heightAuto:false,
          timer: 2000,
          showConfirmButton: false
        }).then(()=>{
          this.showSpinner = false
          location.reload();
        })
     })
    }
  }

  onEditProperty(prop){
    this.brochureFileData = {};
    this.priceSheetFileData ={};
    this.videoFileData = {};
    this.floorPlanFileData = {};
    this.editingProp = prop;
    this.isEditProp = true;    
    this.builderPropertyid = prop.PropId;
    this.addPropModal.present();

    // to store pricesheet filename 
    const bhkKeyMap: { [bhkId: string]: string } = {
      '1': '1-0',
      '2': '1-1',
      '3': '2-0',
      '4': '2-1',
      '0': '0-0'
    };
    prop.Pricesheets.forEach((pricesheet)=>{
      const bhkId = pricesheet.bhkId;
      const key = bhkKeyMap[bhkId];
      if (key) {
        if (!this.priceSheetFileData[key]) {
          this.priceSheetFileData[key] = {
            file: null,
            fileType: '',
            fileName: '',
            result: null
          };
        }
        this.priceSheetFileData[key].fileName = pricesheet.propdetails_pricesheet || '';
      }
    })

    // To store brochure file name 
    if (!this.brochureFileData[0]) {
      this.brochureFileData[0] = {
        file: null,
        fileName:prop.Brochure,
        result: null
      };
    }

    // To store video file name
    const bhkVideoKeyMap: { [bhkId: string]: string } = {
      '1': '1BHK',
      '2': '2BHK',
      '3': '3BHK',
      '4': '4BHK',
      '0': 'Common'
    };
    prop.videos.forEach((videos,i)=>{
      const bhkId = videos.bhkId;
      const key = bhkVideoKeyMap[bhkId];
       const videoFile = {
        file: null,
        fileName: videos.propdetails_video,
        result: null, 
        bhkId:videos.bhkId,
        v_idpk:videos.PV_IDPK
      };  
    
      if (!this.videoFileData[key]) {
        this.videoFileData[key] = [];
      }
      this.videoFileData[key].push(videoFile);
      if(i==0){
        const bhkId = videos.bhkId;
        const key = bhkVideoKeyMap[bhkId];
        this.selectedVideoBHK = key
      }
    })


    // To store Floor Plan File name
    prop.Floorplans.forEach((floorPlan,i)=>{      
      const bhkId = floorPlan.bhkId;
      const key = bhkVideoKeyMap[bhkId];
       const floorPlanFile = {
        file: null,
        fileName: floorPlan.floorplan_image,
        result: null, 
        sqft:floorPlan.sqft,
        bhkId:floorPlan.bhkId,
        fp_idpk:floorPlan.PF_IDPK

      };      
      if (!this.floorPlanFileData[key]) {
        this.floorPlanFileData[key] = [];
      }
      this.floorPlanFileData[key].push(floorPlanFile);

      if(i==0){
        const bhkId = floorPlan.bhkId;
        const key = bhkVideoKeyMap[bhkId];
        this.selectedFloorPlanBHK = key
      }    
    })
    

    //Get the property info
    const div = document.createElement('div');
    div.innerHTML = prop.PropInfo;   
    this.projectInfo = div.innerText.trim();
  }
  propertyList1
  execPropName
  onPropertySearch(){
    this.propertyList1 = this.propertyList.filter((item) => {
      return item.PropName?.toLowerCase().includes(this.execPropName?.toLowerCase());
    });  
  }
}
