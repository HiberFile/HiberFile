<template>
	<!-- @dragover="dragover" @dragleave="dragleave" @drop="drop" -->
	<div>
		<input
			type="file"
			multiple
			v-on="{ change: !dragging ? onChange : () => {} }"
			name="fields[assetsFieldHandle][]"
			id="assetsFieldHandle"
			ref="file"
			class="hidden"
			required
		/>

		<label
			for="assetsFieldHandle"
			class="flex-grow flex flex-col md:flex-row"
			@click.prevent
		>
			<slot></slot>
		</label>
	</div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';

@Component
export default class Dropzone extends Vue {
	filelist: File[] = [];
	limitToast = true;
	dragging = false;

	isFile(file: File) {
		return new Promise((resolve, reject) => {
			if (file.type !== '') {
				return resolve(true);
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				if (reader.error && reader.error.name === 'NotFoundError') {
					return resolve(false);
				}

				resolve(true);
			};

			reader.readAsBinaryString(file);
		});
	}

	Toast(options: any) {
		return this.$swal.fire(
			Object.assign(
				{
					toast: true,
					position: 'top-end',
					showConfirmButton: false,
					timer: 3000,
					timerProgressBar: true,
					didOpen: (toast: HTMLElement) => {
						toast.addEventListener('mouseenter', this.$swal.stopTimer);
						toast.addEventListener('mouseleave', this.$swal.resumeTimer);
					}
				},
				options
			)
		);
	}

	@Watch('filelist', {
		deep: true
	})
	onFilelistChanged(filelist: File[], oldfilelist: File[]) {
		if (
			filelist.map((file) => file.size).reduce((a, b) => a + b, 0) >=
			1024 * 1024 * 30
		) {
			if (this.limitToast) {
				// this.Toast({
				// 	icon: 'warning',
				// 	title:
				// 		'Les fichiers seront chiffrés sur un serveur distant au-delà de 30Mo.'
				// });

				this.limitToast = false;
			}
		} else {
			this.limitToast = true;
		}
	}

	mounted() {
		if (this.$slots && this.$slots.default && this.$slots.default[0].context)
			(this.$slots.default[0].context.$el as HTMLElement)
				.querySelectorAll('[DropzoneClickable]')
				.forEach((el) => {
					(el as HTMLElement).onclick = () => {
						(this.$refs.file as HTMLElement).click();
					};
				});

		const dropzoneExtend = document.querySelector(
			'[DropzoneExtend]'
		) as HTMLElement;

		if (dropzoneExtend) {
			dropzoneExtend.ondragover = this.dragover;
			dropzoneExtend.ondragleave = this.dragleave;
			dropzoneExtend.ondrop = this.drop;
		}
	}

	async onChange() {
		const files = (this.$refs.file as HTMLInputElement).files;
		if (files) {
			if (await this.isFile(files[0])) {
				this.filelist = this.filelist.concat(Array.from(files));
				this.handleInput();
			} else {
				this.Toast({
					icon: 'warning',
					iconColor: '#FCE762',
					title: "Ce type de fichier n'est pas supporté."
				});
			}
		}
	}

	dragover(event: Event) {
		event.preventDefault();
		// (event.target as HTMLElement).classList.add('dragover');
		document.querySelector('[DropzoneStyle]')?.classList.add('dragover');

		(this.$el as HTMLElement).classList.add('dragover');

		this.dragging = true;
	}

	dragleave(event: Event) {
		event.preventDefault();
		// (event.target as HTMLElement).classList.remove('dragover');
		document.querySelector('[DropzoneStyle]')?.classList.remove('dragover');

		(this.$el as HTMLElement).classList.remove('dragover');

		this.dragging = false;
	}

	drop(event: DragEvent) {
		event.preventDefault();

		if (event.dataTransfer) {
			(this.$refs.file as HTMLInputElement).files = event.dataTransfer.files;
			this.onChange();
			// (event.target as HTMLElement).classList.remove('dragover');
			document.querySelector('[DropzoneStyle]')?.classList.remove('dragover');
		}

		(this.$el as HTMLElement).classList.remove('dragover');

		this.dragging = false;
	}

	handleInput() {
		this.$emit('input', this.filelist);
	}
}
</script>
