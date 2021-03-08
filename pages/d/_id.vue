<template>
	<div
		class="px-8 font-sans bg-white dark:bg-black flex-grow min-h-screen text-dark dark:text-white flex flex-col max-w-full"
	>
		<Header :onclicklogo="goToHome" />
		<MainCard>
			<CardContent>
				<div class="download-file flex flex-col items-center">
					<Cross v-if="uploadState === 'error'" class="download-file__cross" />
					<ArrowDown v-else class="download-file__arrow" />
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
					<Button v-if="filename && expireIn != 'finish'" :value="$('download')" @click="download" />
					<Button v-if="filename && !mobile" :value="$('show_qr')" @click="showQR" />
					<Button v-else-if="filename && mobile" :value="$t('share')" @click="shareLink" />
				</div>
			</CardContent>
		</MainCard>
		<Footer />
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
						console.error(err);
						this.uploadState = 'error';
					}
				};
				this.uploadState = 'waiting';
				getState();
			} catch (err) {
				console.error(err);
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

.download-file__arrow, .download-file__cross {
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