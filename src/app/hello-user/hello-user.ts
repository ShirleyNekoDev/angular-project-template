import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
	selector: 'templ-hello-user',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<p data-testid="greeting">{{ greeting() }}</p>
	`,
})
export class HelloUser {
	readonly user = input.required<string>();

	readonly greeting = computed(() => `Hello, ${this.user()}!`);
}
