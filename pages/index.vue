<template>
	<div
		class="p-8 font-sans gradient-radial flex-grow min-h-screen text-white flex flex-col max-w-full"
		:style="{
			'min-height': mobile ? 'calc(var(--vh, 1vh) * 100)' : '',
			'overflow-y': mobile ? 'hidden' : ''
		}"
	>
		<Header :onclicklogo="setAsHome" />
		<div class="flex-grow flex flex-row items-center justify-start my-8">
			<div
				class="flex flex-row items-start justify-start w-full relative h-auto"
			>
				<MainCard
					class="flex-shrink-0 relative h-auto"
					style="transition: 0.2s"
					:style="{
						transform:
							!mobile &&
							!(
								(filelistNotEmpty && !fileId && !mobile) ||
								(!filelistNotEmpty && fileHistory && fileHistory.length > 0)
							)
								? 'translateX(calc(50vw - 50% - 2rem))'
								: 'translateX(0)'
					}"
					DropzoneStyle
					DropzoneExtend
				>
					<CardContent
						v-if="!fileId"
						class="dropzone dragover:border-white dragover:bg-blue-600"
						DropzoneStyle
						DropzoneExtend
					>
						<!-- <div
							class="dragover-layer bg-blue-700 flex justify-center items-center"
						>
							Hello World
						</div> -->
						<Dropzone
							v-model="filelist"
							class="dropzone flex flex-col items-center"
						>
							<div class="send-area flex flex-wrap justify-center">
								<div
									class="flex flex-col items-center justify-between self-stretch"
								>
									<Plus class="w-8 h-8" DropzoneClickable />
									<div class="my-12 flex flex-col items-center">
										<div
											class="send-area__files mb-6 text-lg text-blue-700 w-full inline-grid font-medium"
											DropzoneClickable
										>
											<p class="text-center" v-if="mobile">
												<!-- <template v-if="mobile"> -->
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
												<!-- </template>
												<template v-else-if="!mobile">
													{{ $t('select_files') }}
												</template> -->
											</p>
											<p v-else-if="!mobile" class="text-center">
												{{ $t('select_files') }}
											</p>
										</div>
										<select
											name="duration"
											id="duration"
											ref="duration"
											class="send-area__duration text-blue-700 outline-none text-lg text-blue-700 font-medium bg-opacity-0 bg-white"
										>
											<option value="1_hour">{{ $t('dur_1_hour') }}</option>
											<option value="1_day">{{ $t('dur_1_day') }}</option>
											<option value="3_days">{{ $t('dur_3_days') }}</option>
											<option value="7_days">{{ $t('dur_7_days') }}</option>
											<option value="30_days">{{ $t('dur_30_days') }}</option>
											<option value="never">{{ $t('dur_never') }}</option>
										</select>
									</div>
									<Button
										:value="
											state == 'zip' || state == 'upload'
												? $t('loading')
												: $t('send_now_btn')
										"
										@click.native="uploadFile"
									/>
								</div>
							</div>
						</Dropzone>
					</CardContent>
					<CardContent v-else>
						<div>
							<div class="file-ready flex flex-col items-center">
								<Check
									v-if="state != 'error'"
									class="file-ready__check w-8 h-8"
								/>
								<Cross v-else class="file-ready__cross w-8 h-8" />
								<div class="my-12 flex flex-col items-center w-full">
									<h4
										class="text-lg text-center text-blue-700 font-medium mb-6"
									>
										{{
											state == 'error'
												? $t('upload_error')
												: state != null
												? $t('soon_ready')
												: $t('ready')
										}}
									</h4>
									<Button
										:value="`${origin}/d/${fileId}`"
										ref="downloadableLink"
										class="file-ready__link block w-full truncate"
										@click.native="copyLink"
									/>
								</div>
								<div v-if="state != 'error'" class="w-full">
									<Button
										:value="$t('copy_in_clipboard')"
										@click.native="copyLink"
									/>
									<Button
										v-if="!mobile"
										:value="$t('show_qr')"
										@click.native="showQR"
									/>
									<Button
										v-else-if="mobile"
										:value="$t('share')"
										@click.native="shareLink"
									/>
								</div>
								<!-- <Button
									:value="$t('return_to_home')"
									@click.native="setAsHome"
								/> -->
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
				<div
					v-show="
						!filelistNotEmpty &&
						fileHistory &&
						fileHistory.length > 0 &&
						!mobile
					"
					class="ml-8 min-w-0 absolute h-full overflow-auto"
					style="left: 28rem; width: calc(100% - 30rem)"
				>
					<p class="text-lg font-medium mb-8">{{ $t('your_links') }}</p>
					<table class="table-fixed w-full">
						<tbody>
							<tr v-for="file in fileHistory" :key="file.fileId">
								<td class="text-lg font-normal pr-4 w-5/12 truncate">
									{{ file.filename }}
								</td>
								<td
									class="pl-4 underline cursor-pointer text-xs"
									@click="() => copyLink(`${origin}/d/${file.fileId}`)"
								>
									{{ $t('copy_in_clipboard') }}
								</td>
								<td
									class="pl-4 underline cursor-pointer text-xs"
									@click="() => showQR(`${origin}/d/${file.fileId}`)"
									v-if="!mobile"
								>
									{{ $t('show_qr') }}
								</td>
								<td
									class="pl-4 underline cursor-pointer text-xs"
									@click="
										() =>
											shareLink({
												name: file.filename,
												link: `${origin}/d/${file.fileId}`
											})
									"
									v-else-if="mobile"
								>
									{{ $t('share') }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div
					v-show="filelistNotEmpty && !fileId && !mobile"
					class="ml-8 min-w-0 absolute h-full overflow-auto"
					style="left: 28rem; width: calc(100% - 30rem)"
				>
					<p class="text-lg font-medium mb-8">
						<span v-if="filelist.length === 1">{{ $t('file_selected') }}</span>
						<i18n v-else path="files_selected" tag="span">
							<template v-slot:number>
								<span>{{ filelist.length }}</span>
							</template>
						</i18n>
					</p>
					<ul v-cloak>
						<li
							v-for="(file, key) in filelist"
							:key="key"
							class="text-white inline-flex w-full"
						>
							<p class="truncate">{{ file.name }}</p>
							<!-- <span class="text-xs italic"
						>({{ Math.round((file.size / 10 ** 6) * 100) / 100 }}Mb)</span> -->
							<button
								type="button"
								@click="removeFile(filelist.indexOf(file))"
								title="Remove file"
								class="ml-2 focus:outline-none"
							>
								✕
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
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
	origin: string | null = null;
	state: string | null = null;
	mobile: boolean | null = null;
	fileHistory:
		| { fileId: string; filename: string; expire: Date }[]
		| null = null;

	get filelistNotEmpty() {
		return this.filelist.length > 0;
	}

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
		this.origin = window.location.origin;

		this.fileHistory = (JSON.parse(
			localStorage.getItem('fileHistory') ?? '[]'
		) as { fileId: string; filename: string; expire: string }[])
			.map((file) =>
				new Date(file.expire).getTime() > new Date().getTime()
					? {
							...file,
							expire: new Date(file.expire)
					  }
					: undefined
			)
			.filter((el) => el !== undefined) as {
			fileId: string;
			filename: string;
			expire: Date;
		}[];

		document.documentElement.style.setProperty(
			'--vh',
			`${window.innerHeight * 0.01}px`
		);
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

				if (this.filesize >= 21.85) {
					this.Toast({
						icon: 'info',
						iconColor: '#009BF5',
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
						else if (expireStr === 'never')
							expire =
								(new Date('3333-12-31').getTime() - new Date().getTime()) /
								1000;
						else expire = 3600;

						await uploadFile(
							fileToUpload,
							expire,
							process.env.HIBERAPI_URL!,
							(hiberfileId) => (this.fileId = hiberfileId),
							(progress) => (this.uploadProgress = progress)
						);

						if (this.filename && this.fileId) {
							this.fileHistory = (this.fileHistory ?? []).concat({
								fileId: this.fileId,
								filename:
									this.filename === 'generated_by_hf--to_be_remplaced.zip'
										? `hf_${this.fileId}.zip`
										: this.filename,
								expire: new Date(new Date().getTime() + expire * 1000)
							});

							localStorage.setItem(
								'fileHistory',
								JSON.stringify(this.fileHistory)
							);
						}

						this.state = null;
					} catch (err) {
						this.Toast({
							icon: 'error',
							iconColor: '#F63F3C',
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
					iconColor: '#009BF5',
					title: this.$tc('toast_add_files')
				});
			}
		} else {
			this.Toast({
				icon: 'error',
				iconColor: '#F63F3C',
				title: this.$tc('toast_hiberapi_error')
			});
		}
	}

	copyLink(link?: string) {
		if (typeof link === 'string') {
			const from = document.createElement('textarea');
			document.body.appendChild(from);
			(from as HTMLTextAreaElement).value = link;
			from.select();
			document.execCommand('copy');
			document.body.removeChild(from);
		} else {
			const from = document.querySelector('.file-ready__link') as Element;
			const range = document.createRange();
			window.getSelection()!.removeAllRanges();
			range.selectNode(from);
			window.getSelection()!.addRange(range);
			document.execCommand('copy');
			window.getSelection()!.removeAllRanges();
		}

		this.Toast({
			icon: 'success',
			iconColor: '#3EC300',
			title: this.$tc('toast_link_copy')
		});
	}

	async showQR(link?: string) {
		this.$swal.fire({
			title: 'Code QR',
			text: this.$tc('toast_qr_code'),
			imageUrl: await QRCode.toDataURL(
				link !== undefined && typeof link === 'string'
					? link
					: ((this.$refs.downloadableLink as Vue).$el as HTMLElement).innerText,
				{
					width: 300
				}
			)
		});
	}

	shareLink(spec?: { link: string; name: string }) {
		if (navigator.share && this.filename) {
			navigator
				.share({
					title: spec?.name ?? this.filename,
					text: this.$tc('share_link_text'),
					url:
						typeof spec?.link === 'string'
							? spec?.link
							: (this.$refs.downloadableLink as HTMLElement).innerText
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
    window.open("https://www.hiberfile.com","_self");
	}
}
</script>

<style>
.hiberfile-logo {
	width: 89px;
	height: auto;
}

[DropzoneClickable] {
	cursor: pointer;
}

.dropzone.dragover {
	@apply border-white;
}

.dropzone.dragover > * {
	opacity: 0;
}

select#duration {
	background: url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%2F%3E%3Cpath%20d%3D%22M12%2015l-4.243-4.243%201.415-1.414L12%2012.172l2.828-2.829%201.415%201.414z%22%20fill%3D%22rgba(40%2C81%2C204%2C1)%22%2F%3E%3C%2Fsvg%3E')
		no-repeat 95% 50%;
	padding-right: 20px;
}

main.dragover > div {
	/* @apply bg-blue-600; */
	background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='96' height='96'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M16 13l6.964 4.062-2.973.85 2.125 3.681-1.732 1-2.125-3.68-2.223 2.15L16 13zm-2-7h2v2h5a1 1 0 0 1 1 1v4h-2v-3H10v10h4v2H9a1 1 0 0 1-1-1v-5H6v-2h2V9a1 1 0 0 1 1-1h5V6zM4 14v2H2v-2h2zm0-4v2H2v-2h2zm0-4v2H2V6h2zm0-4v2H2V2h2zm4 0v2H6V2h2zm4 0v2h-2V2h2zm4 0v2h-2V2h2z' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E")
			no-repeat center,
		#2d56d5;
}

main.dragover > div > div {
	@apply border-white;
}

/* .dragover-layer {
	display: none;
}

.dropzone.dragover > .dragover-layer {
	visibility: visible;
	display: inherit;
} */

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
