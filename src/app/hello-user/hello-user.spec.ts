import { inputBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HelloUser } from './hello-user';

describe('HelloUser', () => {
	it('should render a greeting for the given user', () => {
		const fixture = TestBed.createComponent(HelloUser, {
			bindings: [inputBinding('user', () => 'World')],
		});

		fixture.detectChanges();

		expect((fixture.nativeElement as HTMLElement).textContent).toContain('Hello, World!');
	});

	it('should throw when the required user input is missing', () => {
		const fixture = TestBed.createComponent(HelloUser);

		expect(() => {
			fixture.detectChanges();
		}).toThrow(/user/);
	});
});
