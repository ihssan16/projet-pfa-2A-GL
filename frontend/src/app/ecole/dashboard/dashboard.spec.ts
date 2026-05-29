import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponentEcole } from './dashboard';

describe('Dashboard', () => {
  let component: DashboardComponentEcole;
  let fixture: ComponentFixture<DashboardComponentEcole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponentEcole],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponentEcole);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
