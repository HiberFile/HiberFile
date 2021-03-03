<template>
	<div
		class="px-8 font-sans bg-white dark:bg-black flex-grow min-h-screen text-dark dark:text-white flex flex-col max-w-full"
	>
		<header class="h-content my-4">
			<div class="inline-block" @click="setAsHome">
				<Logo class="hiberfile-logo cursor-pointer" />
			</div>
		</header>
		<div
			class="w-full md:w-auto mx-0 md:mx-24 dark:border-none md:dark:border px-0 md:px-6 rounded-none md:rounded-3xl shadow-none md:shadow-xl h-full p-6 md:bg-white md:dark:bg-grey-900 dark:border-grey-800 flex-grow flex"
		>
			<Dropzone
				v-model="filelist"
				v-if="!fileId"
				class="dropzone border-grey-300 dark:border-grey-700 border-2 border-dashed rounded-2xl w-full dragover:border-blue-600 dragover:bg-blue-600 h-full flex flex-col justify-center"
			>
				<div class="send-area px-6 py-16 flex flex-col items-center">
					<Plus class="send-area__plus" DropzoneClickable />
					<h4 class="font-bold my-4 text-center">
						{{ $t('send_now_desc') }}
					</h4>
					<div
						class="send-area__files border border-grey-100 dark:border-grey-700 rounded-2xl px-2 py-1 h-12 mb-3 text-lg leading-loose bg-white dark:bg-black text-grey-600 w-full md:w-9/12 inline-grid"
						DropzoneClickable
					>
						<p v-if="filelist.length === 0" class="truncate cursor-pointer">
							{{ $t('select_files') }}
						</p>
						<p
							v-else-if="filelist.length === 1"
							class="truncate cursor-pointer"
						>
							{{ $t('file_selected') }}
						</p>
						<i18n
							v-else
							class="truncate cursor-pointer"
							path="files_selected"
							tag="p"
						>
							<template v-slot:number>
								<span>{{ filelist.length }}</span>
							</template>
						</i18n>
					</div>
					<select
						name="duration"
						id="duration"
						ref="duration"
						class="send-area__duration border border-grey-100 dark:border-grey-700 rounded-2xl px-2 py-1 h-12 mb-3 text-lg leading-loose bg-white dark:bg-black text-grey-600 w-full md:w-9/12"
					>
						<option value="1_hour">{{ $t('dur_1_hour') }}</option>
						<option value="1_day">{{ $t('dur_1_day') }}</option>
						<option value="3_days">{{ $t('dur_3_days') }}</option>
						<option value="7_days">{{ $t('dur_7_days') }}</option>
						<option value="Never">{{ $t('dur_never') }}</option>
					</select>
					<input
						type="button"
						:value="$t('send_now_btn')"
						class="send-area__send-btn outline-none rounded-2xl flex justify-center items-center mt-2 py-4 px-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium w-auto"
						@click="uploadFile"
					/>
				</div>
			</Dropzone>
			<div
				class="border-grey-300 dark:border-grey-700 border-2 border-dashed rounded-2xl w-full flex flex-col justify-center"
				v-else
			>
				<div class="file-ready px-6 py-16 flex flex-col items-center">
					<Plus class="file-ready__check" />
					<h4 class="font-bold my-4 text-center">
						{{
							state == 'error'
								? $t('upload_error')
								: 100 > uploadProgress
								? $t('soon_ready')
								: $t('ready')
						}}
					</h4>
					<div
						v-if="state != 'error'"
						class="border border-grey-100 dark:border-grey-700 rounded-2xl px-2 py-1 h-12 mb-3 text-lg leading-loose bg-white dark:bg-black text-grey-600 w-auto md:w-9/12 inline-grid"
					>
						<p class="file-ready__link truncate" ref="downloadableLink">
							{{
								host === 'hiberfile.com'
									? 'https://hiber.click/'
									: `${host}/d/`
							}}{{ fileId }}
						</p>
					</div>
					<input
						v-if="state != 'error'"
						type="button"
						:value="$t('copy_in_clipboard')"
						class="file-ready__copy-link outline-none rounded-2xl flex justify-center items-center mt-2 py-4 px-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium w-auto"
						@click="copyLink"
					/>
					<input
						v-if="state != 'error'"
						type="button"
						:value="$t('show_qr')"
						class="file-ready__show-qr outline-none rounded-2xl flex justify-center items-center mt-2 py-4 px-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium w-auto"
						@click="showQR"
					/>
					<input
						type="button"
						:value="$t('return_to_home')"
						class="file-ready__go-home outline-none rounded-2xl flex justify-center items-center mt-2 py-4 px-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium w-auto"
						@click="setAsHome"
					/>
					<progress
						v-if="uploadProgress && 100 > uploadProgress"
						class="rounded-sm w-full h-1 mt-6"
						max="100"
						:value="uploadProgress"
					></progress>
				</div>
			</div>
		</div>
		<footer class="my-12 text-grey-500 font-semibold">
			<nuxt-link to="/mentions" class="text-xs"
				><u>{{ $t('legal_notice') }}</u> | © 2021 HiberFile Team</nuxt-link
			>
		</footer>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import QRCode from 'qrcode';
import JSZip from 'jszip';

@Component
export default class Index extends Vue {
	filelist: Array<File> = [];
	fileId: number | null = null;
	uploadProgress: number | null = null;
	host: string | null = null;
	state: string | null = null;

	beforeMount() {
		this.host = window.location.host;

		window.addEventListener('beforeunload', async (event) => {
			const stateResult = await this.$axios.$post(
				`${process.env.HIBERAPI_URL}/file/upload-state`,
				{
					id: this.fileId,
					abort: true
				}
			);
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

	async uploadFile(event: Event) {
		if (process.env.HIBERAPI_URL && !this.uploadProgress) {
			if (this.filelist.length > 0) {
				let fileToUpload: File;

				this.state = 'zip';
				if (this.filelist.length > 1) {
					const zip = new JSZip();

					this.filelist.forEach((file) => {
						zip.file(file.name, file);
					});

					const content = await zip.generateAsync({
						type: 'blob'
					});

					fileToUpload = new File(
						[content],
						'generated_by_hf--to_be_remplaced.zip'
					);
				} else {
					fileToUpload = this.filelist[0];
				}

				try {
					this.state = 'upload';
					const presignedResult = await this.$axios.$post(
						`${process.env.HIBERAPI_URL}/file/presigned`,
						{
							expireIn: (this.$refs.duration as HTMLInputElement).value,
							filename: fileToUpload.name
						}
					);

					this.fileId = presignedResult.fileId;

					const formData = new FormData();
					formData.append('file', fileToUpload, fileToUpload.name);

					Object.keys(presignedResult.post.fields).forEach((field) => {
						formData.append(field, presignedResult.post.fields[field]);
					});

					const uploadResult = await this.$axios.$post(
						`${
							process.env.NODE_ENV === 'production'
								? 'https://cors-anywhere.herokuapp.com/'
								: ''
						}${presignedResult.post.url}`,
						formData,
						{
							headers: {
								// 'x-amz-server-side-encryption': 'AES256',
							},
							// headers: formData.getHeaders(),
							onUploadProgress: (progressEvent) => {
								const percentCompleted = Math.round(
									(progressEvent.loaded * 100) / progressEvent.total
								);
								this.uploadProgress = percentCompleted;
							}
						}
					);

					const stateResult = await this.$axios.$post(
						`${process.env.HIBERAPI_URL}/file/upload-state`,
						{
							id: this.fileId,
							uploaded: true
						}
					);

					this.state = null;
				} catch (err) {
					console.log(err);
					this.Toast({
						icon: 'error',
						title: "Une erreur est survenue lors de l'envoi de votre fichier."
					});

					this.state = 'error';

					const stateResult = await this.$axios.$post(
						`${process.env.HIBERAPI_URL}/file/upload-state`,
						{
							id: this.fileId,
							error: true
						}
					);

					this.fileId = null;
					this.uploadProgress = null;
					this.host = null;
				}
			} else {
				this.Toast({
					icon: 'info',
					title: 'Ajoutez un ou plusieurs fichiers avant de les envoyer.'
				});
			}
		} else {
			this.Toast({
				icon: 'error',
				title: "Impossible d'accéder à HiberAPI."
			});
		}
	}

	copyLink(event: Event) {
		const from = document.querySelector('.file-ready__link') as Element;
		var range = document.createRange();
		window.getSelection()!.removeAllRanges();
		range.selectNode(from);
		window.getSelection()!.addRange(range);
		document.execCommand('copy');
		window.getSelection()!.removeAllRanges();

		this.Toast({
			icon: 'success',
			title: 'Lien copié'
		});
	}

	async showQR() {
		this.$swal.fire({
			title: 'Code QR',
			text:
				'Scannez ce code QR pour accéder au lien de téléchargement depuis un autre appareil sans devoir entrer le lien manuellement.',
			imageUrl: await QRCode.toDataURL(
				'http://' + (this.$refs.downloadableLink as HTMLElement).innerText,
				{
					width: 300
				}
			)
		});
	}

	setAsHome(event: Event) {
		this.filelist = [];
		this.fileId = null;
		this.uploadProgress = null;
	}
}
</script>

<style>
.hiberfile-logo {
	width: 89px;
	height: auto;
}

.send-area__plus {
	width: 48px;
	height: 48px;
}

.dropzone.dragover {
	@apply border-blue-600;
}

.file-ready__check {
	width: 48px;
	height: 48px;
}

@keyframes progressloading {
	from {
		background-position: left;
	}

	to {
		background-position: right;
	}
}

progress::-webkit-progress-value {
	@apply rounded-sm;

	background: repeating-linear-gradient(
			-45deg,
			rgba(255, 255, 255, 0.25) 0,
			rgba(255, 255, 255, 0.25) 15px,
			transparent 15px,
			transparent 30px
		),
		linear-gradient(90deg, #0060df 15px, #0060df 15px);
	animation: 20s linear infinite progressloading;

	/* linear-gradient(90deg, #0060df 15px, #0060df 15px) */
}

progress::-webkit-progress-bar {
	@apply rounded-sm;
	@apply bg-grey-100;
}
</style>
