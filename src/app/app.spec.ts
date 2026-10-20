import { App } from './app';
import { TestBed } from '@angular/core/testing';

describe('App', () => {
	it('should create the app', () => {
		const fixture = TestBed.configureTestingModule({ imports: [App] }).createComponent(App);
		fixture.detectChanges();

		expect(fixture.componentInstance).toBeInstanceOf(App);
	});
});
