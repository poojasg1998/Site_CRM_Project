import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MandateInactiveJunkComponent } from './mandate-inactive-junk.component';

describe('MandateInactiveJunkComponent', () => {
  let component: MandateInactiveJunkComponent;
  let fixture: ComponentFixture<MandateInactiveJunkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MandateInactiveJunkComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MandateInactiveJunkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
