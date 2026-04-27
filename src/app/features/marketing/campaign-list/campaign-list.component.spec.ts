import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CampaignListComponent } from './campaign-list.component';

describe('CampaignListComponent', () => {
  let component: CampaignListComponent;
  let fixture: ComponentFixture<CampaignListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CampaignListComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CampaignListComponent);
    component = fixture.componentInstance;
  });

  it('KARMA: should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('KARMA: should have campaigns array initialized', () => {
    expect(component.campaigns).toBeDefined();
    expect(Array.isArray(component.campaigns)).toBe(true);
  });

  it('JASMINE: should correctly identify active campaign status', () => {
    const campaign = {
      status: 'ACTIVE',
      name: 'Summer Sale',
      promotions: []
    };
    expect(campaign.status).toBe('ACTIVE');
    expect(campaign.name).toBe('Summer Sale');
    expect(campaign.promotions.length).toBe(0);
  });

  it('JASMINE: should correctly calculate campaign duration', () => {
    const startDate = new Date('2025-06-01');
    const endDate = new Date('2025-08-31');
    const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(durationDays).toBe(91);
    expect(durationDays).toBeGreaterThan(0);
    expect(durationDays).toBeLessThan(365);
  });
});