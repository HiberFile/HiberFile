<template>
	<div
		class="px-8 font-sans bg-white dark:bg-black flex-grow min-h-screen text-dark dark:text-white flex flex-col max-w-full"
	>
		<header class="h-content my-4">
			<div class="inline-block" @click="goToHome">
				<Logo class="hiberfile-logo cursor-pointer" />
			</div>
		</header>
		<div
			class="w-full md:w-auto mx-0 md:mx-24 dark:border-none md:dark:border px-0 md:px-6 rounded-none md:rounded-3xl shadow-none md:shadow-xl h-full p-6 md:bg-white md:dark:bg-grey-900 dark:border-grey-800 flex-grow"
		>
			<div
				class="border-grey-300 dark:border-grey-700 border-2 border-dashed rounded-2xl w-full h-full flex flex-col justify-center"
			>
				<div class="download-file px-6 py-16 flex flex-col items-center">
					<Plus class="download-file__check" />
					<h4 class="font-bold my-4 text-center">
						{{
							uploadState === 'waiting'
								? $t('download_soon')
								: uploadState === 'error'
								? ''
								: $t('download_now')
						}}
					</h4>
					<div class="mb-4 text-center">
						<h3 class="font-bold text-black dark:text-white text-xl">
							{{
								uploadState === 'waiting'
									? $t('waiting_for_file')
									: uploadState === 'error'
									? $t('file_does_not_exist')
									: filename
									? filename
									: $t('loading')
							}}
						</h3>
						<p
							v-if="filePreview && expireIn != 'finish'"
							class="text-xs font-light cursor-pointer underline"
							@click="firePreview"
						>
							({{ $t('preview') }})
						</p>
					</div>
					<h6
						class="mb-3 text-center font-bold text-xs text-black dark:text-white"
					>
						{{
							expireIn
								? expireIn === 'never'
									? $t('link_expire_never')
									: expireIn == 'finish'
									? $t('link_expired')
									: `${$t('link_expire_in')}${expireIn.day}j ${
											expireIn.hour
									  }h ${expireIn.minute}m ${expireIn.second}s`
								: ''
						}}
					</h6>
					<input
						v-if="filename && expireIn != 'finish'"
						type="button"
						:value="$('download')"
						class="download-file__copy-link outline-none rounded-2xl flex justify-center items-center mt-2 py-4 px-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium w-auto"
						@click="download"
					/>
					<input
						v-if="filename"
						type="button"
						:value="$('show_qr')"
						class="download-file__show-qr outline-none rounded-2xl flex justify-center items-center mt-2 py-4 px-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium w-auto"
						@click="showQR"
					/>
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
import { Component, Emit, Prop, Vue, Watch } from 'nuxt-property-decorator';
import QRCode from 'qrcode';

interface RemainingTime {
	day: number;
	hour: number;
	minute: number;
	second: number;
}

@Component({
	asyncData({ params }) {
		const id = params.id;
		return { id };
	}
})
export default class D extends Vue {
	fileUrl: string | null = null;
	filename: string | null = null;
	expire: string | null = null;
	expireIn: string | RemainingTime | null = null;
	uploadState: string | null = null;
	filePreview: string | null = null;

	@Emit()
	expireCalc() {
		if (this.expire) {
			const date = new Date(this.expire);
			const difference = date.getTime() - new Date().getTime();

			if (date == new Date(8640000000000000)) this.expireIn = 'never';
			else if (difference < 0) this.expireIn = 'finish';
			else {
				this.expireIn = {
					day: Math.floor(difference / (1000 * 3600 * 24)),
					hour: Math.floor(difference / (1000 * 3600)) % 24,
					minute: Math.floor(difference / (1000 * 60)) % 60,
					second: Math.floor(difference / 1000) % 60
				};
			}
		} else {
			this.expireIn = null;
		}
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

	async mounted() {
		if (process.env.HIBERAPI_URL) {
			try {
				const getState = async () => {
					try {
						const stateResult = await this.$axios.$get(
							`${process.env.HIBERAPI_URL}/file/upload-state?id=${
								((this as unknown) as { id: string }).id
							}`
						);

						if (
							stateResult.uploaded ||
							stateResult.error ||
							stateResult.abort
						) {
							if (stateResult.uploaded) {
								this.uploadState = 'loading';

								const result = await this.$axios.$get(
									`${process.env.HIBERAPI_URL}/file/presigned?id=${
										((this as unknown) as { id: string }).id
									}`
								);

								this.fileUrl = result.url;
								this.filename = result.filename;
								this.expire = result.expire;

								this.expireCalc();
								setInterval(this.expireCalc, 1000);

								if (
									this.expireIn != 'finish' &&
									/[\/.](gif|jpg|jpeg|tiff|png)$/i.test(this.filename!)
								) {
									const preview = await this.$axios.$get(
										`${
											process.env.NODE_ENV === 'production'
												? 'https://cors-anywhere.herokuapp.com/'
												: ''
										}${this.fileUrl}`,
										{
											responseType: 'blob'
										}
									);

									this.filePreview = URL.createObjectURL(preview);
								}
							} else {
								this.uploadState = 'error';
							}
						} else {
							setTimeout(getState, 5000);
						}
					} catch (err) {
						console.log(err);
						this.uploadState = 'error';
					}
				};
				this.uploadState = 'waiting';
				getState();
			} catch (err) {
				console.log(err);
				this.Toast({
					icon: 'error',
					title: 'Une erreur est survenue lors du chargement des informations.'
				});
			}
		}
	}

	async download() {
		if (this.fileUrl && this.filename && this.expireIn != 'finish') {
			const download = document.createElement('a');

			download.href = this.fileUrl;
			download.download = this.filename;

			download.click();

			download.remove();
		}
	}

	async showQR() {
		this.$swal.fire({
			title: 'Code QR',
			text:
				'Scannez ce code QR pour accéder au lien de téléchargement depuis un autre appareil sans devoir entrer le lien manuellement.',
			imageUrl: await QRCode.toDataURL(window.location.href, {
				width: 300
			})
		});
	}

	firePreview() {
		this.$swal.fire({
			title: 'Prévisualisation',
			text: this.filename!,
			imageUrl: this.filePreview!
		});
	}

	goToHome() {
		this.$router.push({
			path: '/'
		});
	}
}
</script>

<style>
.hiberfile-logo {
	width: 89px;
	height: auto;
}

.download-file__check {
	width: 48px;
	height: 48px;
}

progress::-webkit-progress-value {
	@apply rounded-sm;

	background-image: -webkit-linear-gradient(
			-45deg,
			transparent 33%,
			rgba(255, 255, 255, 0.25) 33%,
			rgba(255, 255, 255, 0.25) 66%,
			transparent 66%
		),
		-webkit-linear-gradient(left, #0060df, #0060df);
}

progress::-webkit-progress-bar {
	@apply bg-grey-100;
}
</style>
