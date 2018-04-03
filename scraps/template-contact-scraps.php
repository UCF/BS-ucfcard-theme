<?php /************ Let's Talk **************/ ?>
<div class="a-form" data-form="1">

	<a href="#" class="title-bar" data-form="1"><span class="form-title">Let's Talk</span></a>

	<div class="collapser">
		<div class="inner">

			<form class="contact-form" data-form="1">

				<div class="form-row">

					<label for="general_full_name" class="input-wrap half left">
						<span class="label-text">Name<span class="gold">*</span></span>
						<input id="general_full_name" type="text" name="general_full_name" placeholder="Name" />
					</label>

					<label for="general_phone" class="input-wrap half right">
						<span class="label-text">Phone Number</span>
						<input id="general_phone" type="text" name="general_phone" placeholder="XXX-XXX-XXXX" />
					</label>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

				<div class="form-row">

					<label for="general_email" class="input-wrap half left">
						<span class="label-text">Email<span class="gold">*</span></span>
						<input id="general_email" type="text" name="general_email" placeholder="example@knights.ucf.edu" />
					</label>

					<label for="general_sign_up" class="input-wrap half right">
						<span class="label-text">Sign Up for Updates &amp; Events</span>
						<input id="general_sign_up" type="checkbox" name="general_sign_up" />
					</label>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

				<div class="form-row">

					<label for="general_message" class="input-wrap">
						<span class="label-text">Message<span class="gold">*</span></span>
						<textarea id="general_message" name="general_message"></textarea>
					</label>
					
				</div><?php /* end .form-row */ ?>

				<div class="form-row oh">

					<input type="hidden" name="action" value="contactsubmit" />
					<input type="hidden" name="form_type" value="general" />

					<button type="submit">
						<span>SUBMIT</span>
					</button>

					<div class="contact-notify">
						<p class="notify-text"></p>
					</div>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

			</form><?php /* end .contact-form */ ?>
			
		</div><?php /* end .inner */ ?>
	</div><?php /* end .collapser */ ?>

</div><?php /* end .a-form */ ?>








<?php /************ Digital Sign Request **************/ ?>
<div class="a-form" id="sign-request-form" data-form="2">

	<a href="#" class="title-bar" data-form="2"><span class="form-title">JWTC Digital Sign Request</span></a>

	<div class="collapser">
		<div class="inner">

			<form class="contact-form" data-form="2">

				<div class="form-row">

					<label for="signage_merchant_name" class="input-wrap">
						<span class="label-text">Merchant Name<span class="gold">*</span></span>
						<input id="signage_merchant_name" type="text" name="signage_merchant_name" placeholder="Merchant Name" />
					</label>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

				<div class="form-row">

					<label for="signage_start_date" class="input-wrap half left">
						<span class="label-text">Requested Image Display Start Date<span class="gold">*</span></span>
						<input id="signage_start_date" type="text" name="signage_start_date" placeholder="MM / DD / YYYY" />
					</label>

					<label for="signage_end_date" class="input-wrap half right">
						<span class="label-text">Requested Image Display End Date<span class="gold">*</span></span>
						<input id="signage_end_date" type="text" name="signage_end_date" placeholder="MM / DD / YYYY" />
					</label>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

				<h5 class="form-heading">Contact Information</h5>

				<div class="form-row">

					<label for="signage_full_name" class="input-wrap half left">
						<span class="label-text">Name<span class="gold">*</span></span>
						<input id="signage_full_name" type="text" name="signage_full_name" placeholder="Name" />
					</label>

					<label for="signage_phone" class="input-wrap half right">
						<span class="label-text">Phone Number<span class="gold">*</span></span>
						<input id="signage_phone" type="text" name="signage_phone" placeholder="XXX-XXX-XXXX" />
					</label>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

				<div class="form-row">

					<label for="signage_email" class="input-wrap half left">
						<span class="label-text">Email<span class="gold">*</span></span>
						<input id="signage_email" type="text" name="signage_email" placeholder="example@knights.ucf.edu" />
					</label>

					<label id="file-browse-wrap" for="signage_file" class="input-wrap half right">
						<span class="label-text">Upload File<span class="gold">*</span></span>
						<span class="browse-button">Browse</span>
						<input class="browse-bar" type="text" value="" readonly id="signage_filename" name="filename" style="width: 100%;" placeholder="Upload File">
						<input id="signage_file" type="file" name="signage_file" placeholder="" accept="image/jpeg,image/pjpeg,image/gif,image/png" />
					</label>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

				<div class="form-row oh">

					<input type="hidden" name="action" value="contactsubmit" />
					<input type="hidden" name="form_type" value="digital_sign" />

					<button type="submit" id="signage-submit-button">
						<span>SUBMIT</span>
					</button>

					<div class="contact-notify">
						<p class="notify-text"></p>
					</div>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

			</form><?php /* end .contact-form */ ?>
			
		</div><?php /* end .inner */ ?>
	</div><?php /* end .collapser */ ?>


</div><?php /* end .a-form */ ?>







<?php /************ Maintenance Work Order **************/ ?>
<div class="a-form" data-form="3">

	<a href="#" class="title-bar" data-form="3"><span class="form-title">Maintenance Work Order</span></a>

	<div class="collapser">
		<div class="inner">

			<form class="contact-form" data-form="3">

				<div class="form-row">

					<label for="maintenance_full_name" class="input-wrap half left">
						<span class="label-text">Name<span class="gold">*</span></span>
						<input id="maintenance_full_name" type="text" name="maintenance_full_name" placeholder="Name" />
					</label>

					<label for="maintenance_phone" class="input-wrap half right">
						<span class="label-text">Phone Number</span>
						<input id="maintenance_phone" type="text" name="maintenance_phone" placeholder="XXX-XXX-XXXX" />
					</label>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

				<div class="form-row">

					<label for="maintenance_email" class="input-wrap half left">
						<span class="label-text">Email<span class="gold">*</span></span>
						<input id="maintenance_email" type="text" name="maintenance_email" placeholder="example@knights.ucf.edu" />
					</label>

					<label for="maintenance_building_name" class="input-wrap half right">
						<span class="label-text">Building<span class="gold">*</span></span>
						<select class="maintenance-drop-down" id="maintenance_building_name" type="text" name="maintenance_building_name">
							<?php 
								$count = 0;
								$building_names = get_field('mf_building_names'); 
							?>
							<?php foreach($building_names as $option){ ?>
								<option value="<?php if($count == 0){ echo ''; } else { echo $option['building_name']; } ?>"><?php echo $option['building_name']; ?></option>
								<?php $count++; ?>
							<?php } ?>
						</select>
					</label>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

				<div class="form-row">

					<label for="maintenance_tenant_name" class="input-wrap half left">
						<span class="label-text">Tenant Name<span class="gold">*</span></span>
						<select class="maintenance-drop-down" id="maintenance_tenant_name" type="text" name="maintenance_tenant_name">
							<?php 
								$count = 0;
								$tenant_names = get_field('mf_tenant_names'); 
							?>
							<?php foreach($tenant_names as $option){ ?>
								<option value="<?php if($count == 0){ echo ''; } else { echo $option['tenant_name']; } ?>"><?php echo $option['tenant_name']; ?></option>
								<?php $count++; ?>
							<?php } ?>
						</select>
					</label>

					<label for="maintenance_repair_item" class="input-wrap half right">
						<span class="label-text">Repair Item<span class="gold">*</span></span>
						<select class="maintenance-drop-down" id="maintenance_repair_item" type="text" name="maintenance_repair_item">
							<?php 
								$count = 0;
								$repair_items = get_field('mf_repair_items'); 
							?>
							<?php foreach($repair_items as $option){ ?>
								<option value="<?php if($count == 0){ echo ''; } else { echo $option['repair_item']; } ?>"><?php echo $option['repair_item']; ?></option>
								<?php $count++; ?>
							<?php } ?>
						</select>
					</label>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

				<div class="form-row">

					<label for="maintenance_message" class="input-wrap">
						<span class="label-text">Message<span class="gold">*</span></span>
						<textarea id="maintenance_message" name="maintenance_message"></textarea>
					</label>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

				<div class="form-row oh">
					
					<input type="hidden" name="action" value="contactsubmit" />
					<input type="hidden" name="form_type" value="maintenance" />

					<button type="submit">
						<span>SUBMIT</span>
					</button>

					<div class="contact-notify">
						<p class="notify-text"></p>
					</div>

					<div class="clear"></div>
					
				</div><?php /* end .form-row */ ?>

			</form><?php /* end .contact-form */ ?>
			
		</div><?php /* end .inner */ ?>
	</div><?php /* end .collapser */ ?>


</div><?php /* end .a-form */ ?>