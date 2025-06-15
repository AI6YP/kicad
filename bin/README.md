


### Documentation and Naming Parameters

* Size source to be added to footprint documentation field (`size_source`) {url}
* Footprint library name (`library`) {string}
* Footprint name generation control
  - Device type added as prefix. Example QFN. (`device_type`) {string}
  - Part number. Will be added as a prefix if given. (`part_number`) {string}
  - Suffix: A custom suffix (added after pin pitch in default naming format). Can include parameters pad_x and pad_y.
Custom naming (custom_name_format) {python format string}

The full default format string is {man:s}_{mpn:s}_{pkg:s}-{pincount:d}-1EP_{size_x:g}x{size_y:g}mm_P{pitch:g}mm{suffix:s}_EP{ep_size_x:g}x{ep_size_y:g}mm_Mask{mask_size_x:g}x{mask_size_y:g}mm{suffix2:s}{vias:s} (The same parameters can be used in your custom format. Exposed pad parameters are not available for components without exposed pad.)


![](qfn.svg)

* Body size (`body_size_x`, `body_size_y`, `overall_height`) {Number}
* Lead dimensions:
  - Lead width (`lead_width`) {Number}
  - Lead length (`lead_len`) {Number}
  - Lead pitch, currently equal for all sides (`pitch`) {Number}






