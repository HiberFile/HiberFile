<template>
	<div
		class="px-8 font-sans bg-white dark:bg-black flex-grow min-h-screen text-dark dark:text-white flex flex-col max-w-full"
	>
		<Header :onclicklogo="setAsHome" />
		<MainCard>
			<CardContent
				v-if="!fileId"
				class="dropzone dragover:border-blue-600 dragover:bg-blue-600"
				DropzoneStyle
				DropzoneExtend
			>
				<Dropzone v-model="filelist" class="dropzone flex-grow flex flex-col">
					<div
						class="send-area flex flex-wrap items-center flex-grow justify-center"
					>
						<div
							class="flex flex-col items-center justify-center self-stretch w-full"
						>
							<Plus class="send-area__plus" DropzoneClickable />
							<h4 class="font-bold my-4 text-center">
								{{ $t('send_now_desc') }}
							</h4>
							<div
								class="send-area__files border border-grey-100 dark:border-grey-700 rounded-2xl px-2 py-1 h-12 mb-3 text-lg leading-loose bg-white dark:bg-black text-grey-600 w-full md:w-9/12 inline-grid"
								DropzoneClickable
							>
								<p class="truncate cursor-pointer">
									<span v-if="filelist.length === 0">{{
										$t('select_files')
									}}</span>
									<span v-else-if="filelist.length === 1">{{
										$t('file_selected')
									}}</span>
									<i18n
										v-else
										class="truncate cursor-pointer"
										path="files_selected"
										tag="span"
									>
										<template v-slot:number>
											<span>{{ filelist.length }}</span>
										</template>
									</i18n>
								</p>
							</div>
							<select
								name="duration"
								id="duration"
								ref="duration"
								class="send-area__duration border border-grey-100 dark:border-grey-700 rounded-2xl px-2 py-1 h-12 mb-3 text-lg leading-loose bg-white dark:bg-black text-grey-600 w-full md:w-9/12 appearance-none"
							>
								<option value="1_hour">{{ $t('dur_1_hour') }}</option>
								<option value="1_day">{{ $t('dur_1_day') }}</option>
								<option value="3_days">{{ $t('dur_3_days') }}</option>
								<option value="7_days">{{ $t('dur_7_days') }}</option>
								<option value="30_days">{{ $t('dur_30_days') }}</option>
							</select>
							<Button
								:value="
									state == 'zip' || state == 'upload'
										? $t('loading')
										: $t('send_now_btn')
								"
								@click.native="uploadFile"
							/>
							<p class="my-4 text-grey-500 text-xs text-center">
								{{ $t('secure_sending') }}
							</p>
						</div>
						<div class="px-6 text-sm self-end" v-if="this.filelist.length > 0">
							<i18n
								class="mb-3 font-bold text-black dark:text-white"
								path="file_list"
								tag="h6"
							>
								<template v-slot:totalSize>
									<span class="text-xs font-normal"
										>({{ Math.round((filelistSize / 10 ** 6) * 100) / 100 }}Mb
										{{ $t('in_total') }})</span
									>
								</template>
							</i18n>

							<ul v-cloak class="pb-4 py-0">
								<li v-for="(file, key) in filelist" :key="key" class="mr-6">
									{{ file.name }}
									<span class="text-xs italic"
										>({{
											Math.round((file.size / 10 ** 6) * 100) / 100
										}}Mb)</span
									><button
										type="button"
										@click="removeFile(filelist.indexOf(file))"
										title="Remove file"
										class="ml-2"
									>
										✕
									</button>
								</li>
							</ul>
						</div>
					</div>
				</Dropzone>
			</CardContent>
			<CardContent v-else>
				<div>
					<div class="file-ready px-6 flex flex-col items-center">
						<Check v-if="state != 'error'" class="file-ready__check" />
						<Cross v-else class="file-ready__cross" />
						<h4 class="font-bold my-4 text-center">
							{{
								state == 'error'
									? $t('upload_error')
									: state != null
									? $t('soon_ready')
									: $t('ready')
							}}
						</h4>
						<div
							v-if="state != 'error'"
							class="border border-grey-100 dark:border-grey-700 rounded-2xl px-2 py-1 h-12 mb-3 text-lg leading-loose bg-white dark:bg-black text-grey-600 w-auto md:w-9/12 inline-grid"
						>
							<!-- <p class="file-ready__link truncate" ref="downloadableLink">
								{{
									host === 'hiberfile.com'
										? 'https://hiber.click/'
										: `${host}/d/`
								}}{{ fileId }}
							</p> -->
							<p
								class="file-ready__link truncate overflow-x-scroll"
								ref="downloadableLink"
							>
								https://hiberfile.com/d/{{ fileId }}
							</p>
						</div>
						<Button
							v-if="state != 'error'"
							:value="$t('copy_in_clipboard')"
							@click.native="copyLink"
						/>
						<Button
							v-if="state != 'error' && !mobile"
							:value="$t('show_qr')"
							@click.native="showQR"
						/>
						<Button
							v-else-if="state != 'error' && mobile"
							:value="$t('share')"
							@click.native="shareLink"
						/>
						<Button :value="$t('return_to_home')" @click.native="setAsHome" />
						<template v-if="state != null">
							<progress
								v-if="uploadProgress && 100 > uploadProgress"
								class="rounded-sm w-full h-1 mt-6"
								max="100"
								:value="uploadProgress"
							></progress>
						</template>
					</div>
				</div>
			</CardContent>
		</MainCard>
		<Footer />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import isMobile from 'assets/scripts/isMobile';
import uploadFile from './../utils/uploadFile';

@Component
export default class Index extends Vue {
	filelist: Array<File> = [];
	filelistSize: number = 0;
	fileId: string | null = null;
	filename: string | null = null;
	filesize: number | null = null;
	uploadProgress: number | null = null;
	host: string | null = null;
	state: string | null = null;
	mobile: boolean | null = null;

	@Watch('filelist', {
		deep: true
	})
	filelistChanged(filelist: Array<File>) {
		if (filelist.length > 0)
			this.filelistSize = filelist
				.map((file) => file.size)
				.reduce((previousValue, currentValue) => previousValue + currentValue);
	}

	beforeMount() {
		this.mobile = isMobile();
		this.host = window.location.host;
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

	removeFile(i: number) {
		this.filelist.splice(i, 1);
	}

	async convertToZip(filelist: File[]) {
		const zip = new JSZip();

		this.filelist.forEach((file) => {
			zip.file(file.name, file);
		});

		const content = await zip.generateAsync({
			type: 'blob'
		});

		return new File([content], 'generated_by_hf--to_be_remplaced.zip');
	}

	async uploadFile(event: Event) {
		if (process.env.HIBERAPI_URL && !this.uploadProgress) {
			if (this.filelist.length > 0) {
				let fileToUpload: File;

				if (this.filelist.length > 1) {
					this.state = 'zip';
					fileToUpload = await this.convertToZip(this.filelist);
				} else {
					fileToUpload = this.filelist[0];
				}

				this.filesize = fileToUpload.size / 1_000_000_000;

				if (this.filesize >= 19.85) {
					this.Toast({
						icon: 'info',
						title: this.$tc('toast_max_size')
					});
				} else {
					try {
						this.state = 'upload';

						this.filename = fileToUpload?.name;

						const expireStr = (this.$refs.duration as HTMLInputElement).value;
						let expire: number;

						if (expireStr === '1_hour') expire = 3600;
						else if (expireStr === '1_day') expire = 3600 * 24;
						else if (expireStr === '3_days') expire = 3600 * 24 * 3;
						else if (expireStr === '7_days') expire = 3600 * 24 * 7;
						else if (expireStr === '30_days') expire = 3600 * 24 * 30;
						else expire = 3600;

						await uploadFile(
							fileToUpload,
							expire,
							process.env.HIBERAPI_URL!,
							(hiberfileId) => (this.fileId = hiberfileId),
							(progress) => (this.uploadProgress = progress)
						);

						this.state = null;
					} catch (err) {
						this.Toast({
							icon: 'error',
							title: this.$tc('toast_send_error')
						});

						this.state = 'error';

						this.fileId = null;
						this.uploadProgress = null;
						this.host = null;
					}
				}
			} else {
				this.Toast({
					icon: 'info',
					title: this.$tc('toast_add_files')
				});
			}
		} else {
			this.Toast({
				icon: 'error',
				title: this.$tc('toast_hiberapi_error')
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
			title: this.$tc('toast_link_copy')
		});
	}

	async showQR() {
		this.$swal.fire({
			title: 'Code QR',
			text: this.$tc('toast_qr_code'),
			imageUrl: await QRCode.toDataURL(
				'https://' + (this.$refs.downloadableLink as HTMLElement).innerText,
				{
					width: 300
				}
			)
		});
	}

	shareLink() {
		if (navigator.share && this.filename) {
			navigator
				.share({
					title: this.filename,
					text: this.$tc('share_link_text'),
					url:
						'https://' + (this.$refs.downloadableLink as HTMLElement).innerText
				})
				.catch(console.error);
		} else {
			// fallback
		}
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

.file-ready__check,
.file-ready__cross {
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
