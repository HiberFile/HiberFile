<template>
	<div @dragover="dragover" @dragleave="dragleave" @drop="drop">
		<input
			type="file"
			multiple
			name="fields[assetsFieldHandle][]"
			id="assetsFieldHandle"
			@change="onChange"
			ref="file"
			class="hidden"
			required
		/>

		<label for="assetsFieldHandle" @click.prevent>
			<slot></slot>
		</label>

		<div class="px-6 text-sm" v-if="this.filelist.length > 0">
			<h6 class="mb-3 font-bold text-black dark:text-white">
				{{ $t('file_list') }}
			</h6>

			<ul v-cloak class="pb-4 py-0">
				<li v-for="(file, key) in filelist" :key="key" class="mr-6">
					{{ file.name
					}}<button
						type="button"
						@click="remove(filelist.indexOf(file))"
						title="Remove file"
						class="ml-2"
					>
						✕
					</button>
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';

@Component
export default class Dropzone extends Vue {
	filelist: File[] = [];
	limitToast = true;

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
				this.Toast({
					icon: 'warning',
					title:
						'Les fichiers seront chiffrés sur un serveur distant au-delà de 30Mo.'
				});

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
					title: "Ce type de fichier n'est pas supporté."
				});
			}
		}
	}

	remove(i: number) {
		this.filelist.splice(i, 1);
	}

	dragover(event: Event) {
		event.preventDefault();
		(event.target as HTMLElement).classList.add('dragover');

		(this.$el as HTMLElement).classList.add('dragover');
	}

	dragleave(event: Event) {
		event.preventDefault();
		(event.target as HTMLElement).classList.remove('dragover');

		(this.$el as HTMLElement).classList.remove('dragover');
	}

	drop(event: DragEvent) {
		event.preventDefault();

		if (event.dataTransfer) {
			(this.$refs.file as HTMLInputElement).files = event.dataTransfer.files;
			this.onChange();
			(event.target as HTMLElement).classList.remove('dragover');
		}

		(this.$el as HTMLElement).classList.remove('dragover');
	}

	handleInput() {
		this.$emit('input', this.filelist);
	}
}
</script>
